import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Bookmark, BookmarkCheck, GraduationCap, LayoutDashboard, LogIn, LogOut, Menu, Search, ShieldCheck, Sparkles, X, UploadCloud, FileText, ChevronRight, Globe2, LockKeyhole, UserRound, Layers3, Play, Trash2, Eye, Plus, CheckCircle2 } from 'lucide-react';
import { supabase, isConfigured } from './lib/supabase';
import { fetchNotes, getPdfUrl, uploadNote, updateNote, deleteNote, verifyAdmin } from './lib/data';

const classes = Array.from({length:12},(_,i)=>i+1);
const streams = ['Science','Commerce','Arts / Humanities'];
const subjects12 = {
  Science:['Physics','Chemistry','Mathematics','Biology','English'],
  Commerce:['Accountancy','Business Studies','Economics','English'],
  'Arts / Humanities':['History','Political Science','Geography','Psychology','Sociology','English']
};
const fade = { hidden:{opacity:0,y:18}, show:{opacity:1,y:0,transition:{duration:.55,ease:[.22,1,.36,1]}} };
const cx = (...v)=>v.filter(Boolean).join(' ');
function App(){
  const [page,setPage]=useState('home'), [session,setSession]=useState(null), [profile,setProfile]=useState(null);
  const [admin,setAdmin]=useState(false), [busy,setBusy]=useState(false), [notice,setNotice]=useState('');
  const [notes,setNotes]=useState([]), [filters,setFilters]=useState({class_level:'12',stream:'Science',subject:'',language:'',search:''});
  const [selected,setSelected]=useState(null), [pdfUrl,setPdfUrl]=useState(''), [authMode,setAuthMode]=useState('login');
  const [mobileOpen,setMobileOpen]=useState(false), [bookmarks,setBookmarks]=useState(()=>JSON.parse(localStorage.getItem('edvora-bookmarks')||'[]'));
  const [form,setForm]=useState({title:'',description:'',class_level:'12',subject:'Physics',stream:'Science',chapter:'',language:'English',is_paid:false});
  const [file,setFile]=useState(null), [editId,setEditId]=useState(null);
  const [auth,setAuth]=useState({email:'',password:'',full_name:''});
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),950); return ()=>clearTimeout(t)},[]);
  useEffect(()=>{
    if(!supabase) return;
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{(async()=>{setProfile(null);setAdmin(false);if(!session?.user)return;
    const {data}=await supabase.from('profiles').select('id,full_name,email').eq('id',session.user.id).maybeSingle();
    setProfile(data||{id:session.user.id,email:session.user.email,full_name:''});
    try{setAdmin(await verifyAdmin())}catch{setAdmin(false)}
  })()},[session]);
  useEffect(()=>{localStorage.setItem('edvora-bookmarks',JSON.stringify(bookmarks))},[bookmarks]);
  useEffect(()=>{if(page==='library'||page==='dashboard'||page==='admin') loadNotes()},[page]);
  async function loadNotes(){try{const data=await fetchNotes(filters);setNotes(data)}catch(e){setNotice(e.message)}}
  async function signIn(e){e.preventDefault();setBusy(true);setNotice('');try{
    if(authMode==='signup'){const {error}=await supabase.auth.signUp({email:auth.email,password:auth.password,options:{data:{full_name:auth.full_name}}});if(error)throw error;setNotice('Account created. Check your email if confirmation is enabled, then sign in.')}
    else {const {error}=await supabase.auth.signInWithPassword({email:auth.email,password:auth.password});if(error)throw error;setPage('dashboard')}
  }catch(e){setNotice(e.message)}finally{setBusy(false)}}
  async function signOut(){await supabase.auth.signOut();setPage('home');setAdmin(false)}
  function go(p){setPage(p);setMobileOpen(false);window.scrollTo({top:0,behavior:'smooth'})}
  async function openNote(n){setSelected(n);setPdfUrl('');try{setPdfUrl(await getPdfUrl(n.pdf_path))}catch(e){setNotice(`Unable to open PDF: ${e.message}`)}}
  function toggleBookmark(id){setBookmarks(b=>b.includes(id)?b.filter(x=>x!==id):[...b,id])}
  async function submitUpload(e){e.preventDefault();setBusy(true);try{
    const fields={title:form.title,description:form.description,class_level:String(form.class_level),subject:form.subject,stream:form.stream,chapter:form.chapter,language:form.language,is_paid:form.is_paid};
    if(editId){await updateNote(editId,{title:fields.title,description:fields.description,class_level:fields.class_level,subject:fields.subject,stream:fields.stream,chapter:fields.chapter,language:fields.language,is_paid:fields.is_paid});setNotice('Note updated.')}
    else {if(!file)throw new Error('Choose a PDF to upload.');await uploadNote({file,fields,userId:session.user.id});setNotice('PDF uploaded and published.')}
    setFile(null);setEditId(null);setForm({...form,title:'',description:'',chapter:''});await loadNotes();
  }catch(e){setNotice(e.message)}finally{setBusy(false)}}
  function startEdit(n){setEditId(n.id);setForm({...form,...n,is_paid:Boolean(n.is_paid)});setPage('admin');window.scrollTo({top:0,behavior:'smooth'})}
  async function remove(n){if(!confirm(`Delete "${n.title}" and its stored PDF?`))return;try{await deleteNote(n);setNotice('Note deleted.');loadNotes()}catch(e){setNotice(e.message)}}
  const shownNotes=useMemo(()=>page==='bookmarks'?notes.filter(n=>bookmarks.includes(n.id)):notes,[notes,bookmarks,page]);
  return <div className="app-shell">
    <AnimatePresence>{loading&&<motion.div className="loader" initial={{opacity:1}} exit={{opacity:0}}><div className="loader-mark">E<span>.</span></div><div className="loader-line"><i/></div><small>LEARNING BEYOND LIMITS</small></motion.div>}</AnimatePresence>
    <header className="topbar glass">
      <button className="brand" onClick={()=>go('home')}><span className="brand-symbol">E</span><span>EDVORA<small>LEARN BEYOND LIMITS</small></span></button>
      <nav className={cx('nav-links',mobileOpen&&'open')}>
        <button onClick={()=>go('home')}>Home</button><button onClick={()=>go('library')}>Notes Library</button><button onClick={()=>go('classes')}>Classes 1–12</button>
        {session&&<button onClick={()=>go('dashboard')}>Dashboard</button>}
        {admin&&<button onClick={()=>go('admin')}>Admin</button>}
        {mobileOpen&&<button className="mobile-close" onClick={()=>setMobileOpen(false)}><X/></button>}
      </nav>
      <div className="top-actions">{session?<><button className="avatar" onClick={()=>go('dashboard')}>{(profile?.full_name||profile?.email||'S').slice(0,1).toUpperCase()}</button><button className="icon-btn" title="Sign out" onClick={signOut}><LogOut size={18}/></button></>:<button className="btn btn-dark btn-small" onClick={()=>go('auth')}>Student login <ArrowRight size={15}/></button>}
      <button className="menu-btn" onClick={()=>setMobileOpen(!mobileOpen)}><Menu/></button></div>
    </header>
    {notice&&<div className="notice"><span>{notice}</span><button onClick={()=>setNotice('')}><X size={16}/></button></div>}
    <main>
      {page==='home'&&<Home go={go} setFilters={setFilters} />}
      {page==='classes'&&<Classes go={go} setFilters={setFilters}/>}
      {page==='library'&&<Library filters={filters} setFilters={setFilters} notes={notes} loadNotes={loadNotes} openNote={openNote} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />}
      {page==='auth'&&<section className="auth-wrap"><div className="auth-art"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>Make your<br/><em>ambition</em> matter.</h1><p>One thoughtful lesson at a time.</p><div className="orbit"><div className="orbit-core"><GraduationCap size={46}/></div><span className="orbit-dot dot-a"/><span className="orbit-dot dot-b"/></div></div><form className="auth-card glass-card" onSubmit={signIn}><span className="eyebrow">STUDENT ACCESS</span><h2>{authMode==='login'?'Welcome back':'Create your account'}</h2><p className="muted">Your learning space, beautifully organised.</p>{authMode==='signup'&&<Field label="Full name"><input required value={auth.full_name} onChange={e=>setAuth({...auth,full_name:e.target.value})} placeholder="Your name"/></Field>}<Field label="Email address"><input required type="email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} placeholder="you@example.com"/></Field><Field label="Password"><input required minLength="6" type="password" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} placeholder="At least 6 characters"/></Field><button className="btn btn-primary full" disabled={busy||!isConfigured}>{busy?'Please wait…':authMode==='login'?'Sign in':'Create account'} <ArrowRight size={17}/></button>{!isConfigured&&<p className="tiny warning">Add your Supabase publishable key in the .env file to enable accounts.</p>}<p className="switch-auth">{authMode==='login'?"New to EDVORA?":"Already registered?"} <button type="button" onClick={()=>setAuthMode(authMode==='login'?'signup':'login')}>{authMode==='login'?'Create an account':'Sign in'}</button></p></form></section>}
      {page==='dashboard'&&<section className="page-section"><PageIntro eyebrow="STUDENT SPACE" title={`Hello${profile?.full_name?' '+profile.full_name.split(' ')[0]:''}.`} desc="Pick up where your curiosity left off."/><div className="dashboard-grid"><div className="dash-card blue-card"><span className="dash-icon"><BookOpen/></span><h3>Explore the library</h3><p>Find chapter-wise notes and focused revision material.</p><button className="text-link" onClick={()=>go('library')}>Browse notes <ArrowRight size={16}/></button></div><div className="dash-card"><span className="dash-icon"><Bookmark/></span><h3>Your bookmarks</h3><p>{bookmarks.length} saved learning resources.</p><button className="text-link" onClick={()=>{go('bookmarks');loadNotes()}}>View bookmarks <ArrowRight size={16}/></button></div><div className="dash-card"><span className="dash-icon"><GraduationCap/></span><h3>Learning paths</h3><p>Explore classes 1–12 and find your next subject.</p><button className="text-link" onClick={()=>go('classes')}>Choose a class <ArrowRight size={16}/></button></div></div>{admin&&<button className="btn btn-dark" onClick={()=>go('admin')}><ShieldCheck size={17}/> Open admin workspace</button>}</section>}
      {page==='bookmarks'&&<section className="page-section"><PageIntro eyebrow="YOUR COLLECTION" title="Saved for later." desc="Your personal shelf of useful study material."/><NoteGrid notes={shownNotes} openNote={openNote} bookmarks={bookmarks} toggleBookmark={toggleBookmark}/></section>}
      {page==='admin'&&<section className="page-section"><PageIntro eyebrow="OWNER WORKSPACE" title="Publish with purpose." desc="Manage learning resources in your EDVORA library."/><div className="admin-layout"><form className="admin-form glass-card" onSubmit={submitUpload}><div className="form-head"><span className="dash-icon"><UploadCloud/></span><div><h3>{editId?'Edit note details':'Publish a new note'}</h3><p className="muted">PDFs are uploaded to your private notes-pdfs bucket.</p></div></div><Field label="Note title"><input required value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Electrostatics — Complete Notes"/></Field><Field label="Short description"><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What will students learn?"/></Field><div className="field-grid"><Field label="Class"><select value={form.class_level} onChange={e=>setForm({...form,class_level:e.target.value})}>{classes.map(c=><option key={c} value={c}>{`Class ${c}`}</option>)}</select></Field><Field label="Stream"><select value={form.stream} onChange={e=>setForm({...form,stream:e.target.value})}>{streams.map(s=><option>{s}</option>)}</select></Field><Field label="Subject"><input required value={form.subject||''} onChange={e=>setForm({...form,subject:e.target.value})}/></Field><Field label="Chapter"><input required value={form.chapter||''} onChange={e=>setForm({...form,chapter:e.target.value})}/></Field><Field label="Language"><select value={form.language} onChange={e=>setForm({...form,language:e.target.value})}><option>English</option><option>Hindi</option></select></Field></div><label className="upload-zone"><UploadCloud size={25}/><b>{file?file.name:'Choose a PDF file'}</b><small>PDF only · select a chapter document</small><input type="file" accept="application/pdf,.pdf" onChange={e=>setFile(e.target.files?.[0]||null)} disabled={Boolean(editId)}/></label><label className="checkline"><input type="checkbox" checked={Boolean(form.is_paid)} onChange={e=>setForm({...form,is_paid:e.target.checked})}/> Mark as paid (payment access enforcement is a future server-side feature)</label><button className="btn btn-primary full" disabled={busy}>{busy?'Saving…':editId?'Save changes':'Upload & publish'} <ArrowRight size={17}/></button>{editId&&<button type="button" className="btn btn-ghost full" onClick={()=>{setEditId(null);setForm({...form,title:'',description:'',chapter:''})}}>Cancel edit</button>}</form><div className="admin-list"><div className="list-title"><div><span className="eyebrow">CONTENT MANAGER</span><h3>Published notes</h3></div><button className="icon-btn" onClick={loadNotes}><Layers3 size={18}/></button></div>{notes.map(n=><div className="manage-row" key={n.id}><span className="file-icon"><FileText/></span><div className="manage-info"><b>{n.title}</b><small>Class {n.class_level} · {n.subject} · {n.language}</small></div><button className="icon-btn" onClick={()=>startEdit(n)} title="Edit"><Eye size={17}/></button><button className="icon-btn danger" onClick={()=>remove(n)} title="Delete"><Trash2 size={17}/></button></div>)}</div></div></section>}
    </main>
    <Footer go={go}/>
    <AnimatePresence>{selected&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>{setSelected(null);setPdfUrl('')}}><motion.div className="pdf-modal" initial={{y:28,scale:.98}} animate={{y:0,scale:1}} exit={{y:20,opacity:0}} onClick={e=>e.stopPropagation()}><div className="pdf-head"><div><b>{selected.title}</b><small>{selected.subject} · Chapter {selected.chapter}</small></div><button className="icon-btn" onClick={()=>{setSelected(null);setPdfUrl('')}}><X/></button></div>{pdfUrl?<iframe title={selected.title} src={pdfUrl} />:<div className="pdf-loading"><div className="spinner"/><p>Preparing your document…</p></div>}</motion.div></motion.div>}</AnimatePresence>
  </div>
}
function Home({go,setFilters}){
  const [query,setQuery]=useState('');
  function searchNotes(e){
    e.preventDefault();
    setFilters(f=>({...f,search:query}));
    go('library');
  }
  return <>
    <section className="hero">
      <div className="hero-glow"/>
      <div className="hero-copy">
        <motion.span variants={fade} initial="hidden" animate="show" className="eyebrow"><Sparkles size={14}/> INDIA'S SMART LEARNING PLATFORM</motion.span>
        <motion.h1 variants={fade} initial="hidden" animate="show" transition={{delay:.08}}>Learn smarter.<br/><em>Grow bigger.</em></motion.h1>
        <motion.p variants={fade} initial="hidden" animate="show" transition={{delay:.16}}>Access premium notes, CBSE and NCERT study resources for Classes 1–12. Your next chapter starts here.</motion.p>
        <form className="hero-search" onSubmit={searchNotes}>
          <Search size={19}/>
          <input aria-label="Search notes, classes or topics" placeholder="Search notes, classes or topics…" value={query} onChange={e=>setQuery(e.target.value)}/>
          <button type="submit">Search <ArrowRight size={16}/></button>
        </form>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={()=>go('classes')}>Explore classes <ArrowRight size={17}/></button>
          <button className="btn btn-glass" onClick={()=>go('library')}><BookOpen size={17}/> Browse notes</button>
        </div>
        <div className="hero-proof"><span className="proof-pill"><ShieldCheck size={15}/> Student-first learning</span><span className="proof-pill"><Sparkles size={15}/> Simple. Focused. Useful.</span></div>
      </div>
      <div className="hero-visual">
        <div className="hero-ring"/>
        <div className="photo-frame"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=88" alt="Students learning together"/><div className="photo-overlay"/><div className="photo-caption"><span>THE EDVORA WAY</span><b>Learn. Practice. Excel.</b></div></div>
        <motion.div className="float-card card-top" animate={{y:[0,-9,0],rotate:[1,0,1]}} transition={{duration:5,repeat:Infinity}}><span className="float-icon"><GraduationCap/></span><div><b>Dream big.</b><small>Build your future, one lesson at a time.</small></div></motion.div>
        <motion.div className="float-card card-bottom" animate={{y:[0,8,0]}} transition={{duration:4.5,repeat:Infinity}}><span className="float-stat">1–12</span><div><b>Classes covered</b><small>One learning destination</small></div></motion.div>
        <div className="orb orb-one"/><div className="orb orb-two"/>
      </div>
      <div className="hero-index">01 <span/> 03</div>
    </section>
    <section className="quick-links" aria-label="EDVORA learning features">
      <button onClick={()=>go('library')}><span className="quick-icon"><BookOpen/></span><span><b>Notes Library</b><small>CBSE · NCERT · All subjects</small></span><ArrowRight/></button>
      <button onClick={()=>go('classes')}><span className="quick-icon"><GraduationCap/></span><span><b>Classes 1–12</b><small>Find your class and stream</small></span><ArrowRight/></button>
      <button onClick={()=>go('auth')}><span className="quick-icon"><LayoutDashboard/></span><span><b>Student Dashboard</b><small>Your own learning space</small></span><ArrowRight/></button>
      <button onClick={()=>go('library')}><span className="quick-icon"><Bookmark/></span><span><b>Save & Revisit</b><small>Bookmark useful notes</small></span><ArrowRight/></button>
    </section>
    <section className="intro-strip"><div><span className="eyebrow">THE EDVORA DIFFERENCE</span><h2>Make every study<br/>session <em>count.</em></h2></div><p>Thoughtfully organised resources, clear explanations and a calmer way to learn — built to help students move forward with confidence.</p></section>
    <section className="feature-section"><div className="section-head"><div><span className="eyebrow">YOUR LEARNING, REIMAGINED</span><h2>A smarter way<br/>to <em>move forward.</em></h2></div><button className="text-link" onClick={()=>go('library')}>Explore the library <ArrowRight size={16}/></button></div><div className="feature-grid"><Feature icon={<BookOpen/>} n="01" title="Chapter-wise notes" desc="Find focused explanations and revision material, organised around your syllabus."/><Feature icon={<Bookmark/>} n="02" title="Your own study shelf" desc="Bookmark useful resources and return to them whenever you need."/><Feature icon={<Globe2/>} n="03" title="Learn your way" desc="Explore content by class, stream, subject and language."/></div></section>
    <section className="class-banner"><div><span className="eyebrow">FROM FIRST STEPS TO BIG DREAMS</span><h2>One destination.<br/><em>Twelve classes.</em></h2><p>Explore learning resources for classes 1 through 12.</p><button className="btn btn-dark" onClick={()=>go('classes')}>Find your class <ArrowRight size={17}/></button></div><div className="class-orbit">{[1,2,3,4,5,6,7,8,9,10,11,12].map(n=><span key={n} style={{'--i':n}}>{n}</span>)}</div></section>
  </>;
}
function Feature({icon,n,title,desc}){return <motion.article className="feature-card" variants={fade} initial="hidden" whileInView="show" viewport={{once:true,amount:.3}}><div className="feature-top">{icon}<span>{n}</span></div><h3>{title}</h3><p>{desc}</p><div className="feature-line"/></motion.article>}
function Classes({go,setFilters}){return <section className="page-section"><PageIntro eyebrow="CHOOSE YOUR JOURNEY" title="Every class. A new possibility." desc="Start with your class and discover a clearer way to study."/><div className="classes-grid">{classes.map(n=><button className={cx('class-tile',n===12&&'highlight')} key={n} onClick={()=>{setFilters(f=>({...f,class_level:String(n)}));go('library')}}><span>CLASS</span><b>{String(n).padStart(2,'0')}</b><ArrowRight size={18}/></button>)}</div><div className="stream-row"><div><span className="eyebrow">CLASS 12 PATHWAYS</span><h3>Choose your stream</h3></div>{streams.map((s,i)=><button className="stream-card" key={s} onClick={()=>{setFilters(f=>({...f,class_level:'12',stream:s}));go('library')}}><span>{['◈','▤','✳'][i]}</span><b>{s}</b><ArrowRight size={16}/></button>)}</div></section>}
function Library({filters,setFilters,notes,loadNotes,openNote,bookmarks,toggleBookmark}){return <section className="page-section"><PageIntro eyebrow="THE NOTES LIBRARY" title="Knowledge, within reach." desc="Find chapter-wise notes by class, stream, subject and language."/><div className="filter-panel glass-card"><div className="search-box"><Search size={18}/><input placeholder="Search subjects, chapters or topics…" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} onKeyDown={e=>e.key==='Enter'&&loadNotes()}/></div><div className="filter-row"><select value={filters.class_level} onChange={e=>setFilters({...filters,class_level:e.target.value})}><option value="">All classes</option>{classes.map(n=><option value={n}>Class {n}</option>)}</select><select value={filters.stream} onChange={e=>setFilters({...filters,stream:e.target.value})}><option value="">All streams</option>{streams.map(s=><option>{s}</option>)}</select><select value={filters.language} onChange={e=>setFilters({...filters,language:e.target.value})}><option value="">All languages</option><option>English</option><option>Hindi</option></select><button className="btn btn-primary" onClick={loadNotes}>Find notes <Search size={16}/></button></div></div><div className="results-head"><span>{notes.length} resources</span><span>Curated for focused learning</span></div><NoteGrid notes={notes} openNote={openNote} bookmarks={bookmarks} toggleBookmark={toggleBookmark}/></section>}
function NoteGrid({notes,openNote,bookmarks,toggleBookmark}){return notes.length?<div className="notes-grid">{notes.map(n=><article className="note-card" key={n.id}><div className="note-card-top"><span className="pdf-chip"><FileText size={14}/> PDF</span><button className="bookmark-btn" onClick={()=>toggleBookmark(n.id)}>{bookmarks.includes(n.id)?<BookmarkCheck size={18}/>:<Bookmark size={18}/>}</button></div><span className="eyebrow">CLASS {n.class_level} · {n.language}</span><h3>{n.title}</h3><p>{n.description||`${n.subject} · Chapter ${n.chapter}`}</p><div className="note-meta"><span>{n.subject}</span><span>{n.is_paid?'PAID':'FREE'}</span></div><button className="text-link" onClick={()=>openNote(n)}>Read notes <ArrowRight size={16}/></button></article>)}</div>:<div className="empty-state"><span className="empty-icon"><FileText/></span><h3>Your next insight is waiting.</h3><p>No published notes match these filters yet. Try another class or subject.</p></div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function PageIntro({eyebrow,title,desc}){return <div className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div>}
function Footer({go}){return <footer className="footer"><div className="footer-main"><div className="brand footer-brand"><span className="brand-symbol">E</span><span>EDVORA<small>LEARN BEYOND LIMITS</small></span></div><p>Education with Vision,<br/>Learning for a Better Future.</p><div className="footer-links"><button onClick={()=>go('classes')}>Classes</button><button onClick={()=>go('library')}>Notes Library</button><button onClick={()=>go('auth')}>Student access</button></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} EDVORA. Built for brighter futures.</span><span>LEARN WITH INTENTION <Sparkles size={13}/></span></div></footer>}
export default App;
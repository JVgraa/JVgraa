import { useEffect, useMemo, useState } from 'react'

const initialTasks = [
  { id: 1, title: 'Definir problema de pesquisa', owner: 'Você', due: '2026-11-12', priority: 'Alta', status: 'doing' },
  { id: 2, title: 'Criar roteiro das entrevistas', owner: 'Maria', due: '2026-11-14', priority: 'Média', status: 'todo' },
  { id: 3, title: 'Revisar referências do relatório', owner: 'Lucas', due: '2026-11-11', priority: 'Alta', status: 'todo' },
  { id: 4, title: 'Organizar estrutura da apresentação', owner: 'Você', due: '2026-11-18', priority: 'Média', status: 'done' },
  { id: 5, title: 'Atualizar quadro de tarefas', owner: 'Ana', due: '2026-11-20', priority: 'Baixa', status: 'done' },
]

const nav = [
  ['dashboard', '⌂', 'Visão geral'], ['groups', '◉', 'Meus grupos'], ['projects', '▣', 'Projetos'],
  ['tasks', '✓', 'Tarefas'], ['calendar', '□', 'Calendário'], ['materials', '▤', 'Materiais'],
  ['notes', '✎', 'Notas'], ['done', '★', 'Concluídos'], ['chat', '◌', 'Bate-papo'],
]
const columns = [['todo', 'A fazer'], ['doing', 'Fazendo'], ['done', 'Pronto']]
const statusLabels = { todo: 'A fazer', doing: 'Fazendo', done: 'Pronto' }
const dateLabel = (value) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`))

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('soat-tasks')) || initialTasks } catch { return initialTasks }
  })
  const [form, setForm] = useState({ title: '', owner: 'Você', due: '', priority: 'Média', status: 'todo' })

  useEffect(() => localStorage.setItem('soat-tasks', JSON.stringify(tasks)), [tasks])
  const completed = tasks.filter(t => t.status === 'done').length
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const upcoming = useMemo(() => [...tasks].filter(t => t.status !== 'done').sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3), [tasks])

  function moveTask(id, nextStatus) {
    setTasks(current => current.map(t => t.id === id ? { ...t, status: nextStatus } : t))
    setMessage(nextStatus === 'done' ? 'Tarefa concluída. O progresso do projeto foi atualizado.' : 'Status da tarefa atualizado.')
  }
  function submitTask(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.due) return
    setTasks(current => [...current, { ...form, id: Date.now(), title: form.title.trim() }])
    setForm({ title: '', owner: 'Você', due: '', priority: 'Média', status: 'todo' })
    setIsModalOpen(false)
    setMessage('Nova tarefa criada e adicionada ao quadro.')
  }
  function selectPage(page) { setActive(page); setIsMenuOpen(false) }

  return <div className="app-shell">
    <header className="mobile-header"><button className="icon-button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menu">☰</button><Logo /></header>
    <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`} aria-label="Navegação principal">
      <div className="brand"><Logo /><button className="close-menu" onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu">×</button></div>
      <nav>{nav.map(([id, icon, label]) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => selectPage(id)}><span aria-hidden="true">{icon}</span>{label}</button>)}</nav>
      <div className="profile"><div className="avatar">JV</div><div><strong>João Vithor</strong><small>Estudante</small></div><button className="more" aria-label="Mais opções">⋮</button></div>
    </aside>
    {isMenuOpen && <button className="backdrop" aria-label="Fechar menu" onClick={() => setIsMenuOpen(false)} />}
    <main>
      {message && <div className="toast" role="status">{message}<button onClick={() => setMessage('')} aria-label="Fechar aviso">×</button></div>}
      {active === 'dashboard' ? <Dashboard tasks={tasks} progress={progress} upcoming={upcoming} onOpenTasks={() => setActive('tasks')} /> :
       active === 'tasks' ? <Tasks tasks={tasks} onMove={moveTask} onAdd={() => setIsModalOpen(true)} /> :
       active === 'calendar' ? <Calendar tasks={tasks} /> :
       active === 'done' ? <Done tasks={tasks} /> : <Placeholder page={nav.find(item => item[0] === active)?.[2]} onTasks={() => setActive('tasks')} />}
    </main>
    <button className="floating-add" onClick={() => setIsModalOpen(true)} aria-label="Adicionar tarefa">+</button>
    {isModalOpen && <TaskModal form={form} setForm={setForm} onSubmit={submitTask} onClose={() => setIsModalOpen(false)} />}
  </div>
}

function Logo() { return <div className="logo" aria-label="SOAT"><span>SO</span><b>AT</b></div> }
function PageHeader({ eyebrow, title, children }) { return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{children}</header> }

function Dashboard({ tasks, progress, upcoming, onOpenTasks }) { return <>
  <PageHeader eyebrow="Olá, João!" title="Bom dia, vamos organizar seu projeto?" />
  <section className="project-card"><div><div className="project-title"><span className="project-icon">▣</span><div><h2>Projeto IHC — SOAT</h2><p>Interação Humano-Computador · IFRS</p></div></div><div className="members"><span>JV</span><span>MA</span><span>LA</span><span>+2</span></div></div><div className="project-progress"><div className="progress-caption"><strong>Progresso do projeto</strong><b>{progress}%</b></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><p>{tasks.filter(t => t.status === 'done').length} de {tasks.length} tarefas concluídas</p></div></section>
  <section className="dashboard-grid"><div className="panel"><div className="section-title"><h2>Próximas entregas</h2><button onClick={onOpenTasks}>Ver todas</button></div>{upcoming.length ? upcoming.map(t => <div className="deadline" key={t.id}><div className="date-box"><b>{new Date(`${t.due}T12:00:00`).getDate()}</b><span>{new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(new Date(`${t.due}T12:00:00`)).replace('.','')}</span></div><div><strong>{t.title}</strong><p>{t.owner} · {t.priority} prioridade</p></div><span className={`pill ${t.priority === 'Alta' ? 'danger' : ''}`}>{t.priority}</span></div>) : <Empty title="Nenhuma entrega pendente" text="Você está em dia com o projeto." />}</div>
  <div className="panel activity"><div className="section-title"><h2>Atividade recente</h2></div><Activity initials="MA" color="blue" text="Maria criou “Criar roteiro das entrevistas”." time="Há 20 min" /><Activity initials="JV" color="yellow" text="Você concluiu “Organizar estrutura da apresentação”." time="Há 1 h" /><Activity initials="LA" color="green" text="Lucas atualizou uma tarefa do relatório." time="Ontem" /></div></section>
</>}
function Activity({ initials, color, text, time }) { return <div className="activity-item"><span className={`avatar ${color}`}>{initials}</span><div><p>{text}</p><small>{time}</small></div></div> }

function Tasks({ tasks, onMove, onAdd }) { return <><PageHeader eyebrow="Projeto IHC — SOAT" title="Tarefas"><button className="primary-button" onClick={onAdd}>+ Nova tarefa</button></PageHeader><div className="task-toolbar"><label className="search"><span>⌕</span><input placeholder="Buscar tarefa" aria-label="Buscar tarefa" /></label><button className="filter">☷ Filtrar</button><button className="filter">Ordenar ▾</button></div><section className="board">{columns.map(([status, label]) => <div className={`column ${status}`} key={status}><div className="column-header"><h2>{label}</h2><span>{tasks.filter(t => t.status === status).length}</span></div>{tasks.filter(t => t.status === status).map(task => <TaskCard key={task.id} task={task} onMove={onMove} />)}<button className="add-inline" onClick={onAdd}>+ Adicionar tarefa</button></div>)}</section></> }
function TaskCard({ task, onMove }) { const next = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo'; return <article className="task-card"><div className="task-card-top"><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><button className="card-menu" aria-label="Mais ações">⋯</button></div><h3>{task.title}</h3><div className="task-meta"><span>◷ {dateLabel(task.due)}</span><span className="small-avatar">{task.owner === 'Você' ? 'JV' : task.owner.slice(0,2).toUpperCase()}</span></div><button className="move-button" onClick={() => onMove(task.id, next)}>{task.status === 'done' ? 'Reabrir tarefa' : `Mover para ${statusLabels[next]}`} →</button></article> }

function Calendar({ tasks }) { const days = Array.from({length: 30}, (_, i) => i + 1); const events = tasks.reduce((all,t) => { const d = Number(t.due.slice(-2)); (all[d] ||= []).push(t); return all }, {}); return <><PageHeader eyebrow="Projeto IHC — SOAT" title="Calendário"><button className="filter">‹ Novembro 2026 ›</button></PageHeader><section className="calendar panel"><div className="weekday-row">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=><b key={d}>{d}</b>)}</div><div className="days-grid">{Array.from({length:6},(_,i)=><span className="muted-day" key={`blank${i}`}></span>)}{days.map(day=><div className="calendar-day" key={day}><span>{day}</span>{events[day]?.map(t=><button key={t.id} className={`event ${t.status}`} onClick={() => alert(`${t.title}\nResponsável: ${t.owner}`)}>{t.title}</button>)}</div>)}</div></section><section className="panel upcoming-list"><div className="section-title"><h2>Próximas entregas</h2></div>{tasks.filter(t=>t.status!=='done').sort((a,b)=>a.due.localeCompare(b.due)).map(t=><div className="deadline" key={t.id}><strong>{dateLabel(t.due)}</strong><span>{t.title}</span><small>{t.owner}</small></div>)}</section></> }
function Done({ tasks }) { const done = tasks.filter(t=>t.status==='done'); return <><PageHeader eyebrow="Projeto IHC — SOAT" title="Tarefas concluídas" /><section className="panel completed"><div className="completion-badge">★</div><h2>{done.length} tarefas entregues</h2><p>Bom trabalho. Estas tarefas continuam disponíveis para consulta.</p>{done.map(t=><div className="deadline" key={t.id}><span className="check">✓</span><div><strong>{t.title}</strong><p>Concluída · {t.owner}</p></div></div>)}</section></> }
function Placeholder({ page, onTasks }) { return <><PageHeader eyebrow="Projeto IHC — SOAT" title={page} /><section className="panel empty-page"><div className="empty-icon">◌</div><h2>Esta área está pronta para você</h2><p>Use as tarefas para manter o trabalho do grupo organizado em um único lugar.</p><button className="primary-button" onClick={onTasks}>Abrir tarefas</button></section></> }
function Empty({ title, text }) { return <div className="empty"><div>✓</div><strong>{title}</strong><p>{text}</p></div> }

function TaskModal({ form, setForm, onSubmit, onClose }) { const field = (name, value) => setForm(current => ({ ...current, [name]: value })); return <div className="modal-backdrop" role="presentation"><form className="modal" onSubmit={onSubmit}><div className="modal-header"><div><p className="eyebrow">Projeto IHC — SOAT</p><h2>Nova tarefa</h2></div><button type="button" onClick={onClose} className="icon-button" aria-label="Fechar">×</button></div><label>Título da tarefa<input autoFocus required value={form.title} onChange={e=>field('title',e.target.value)} placeholder="Ex.: Preparar perguntas da entrevista" /></label><div className="form-row"><label>Responsável<select value={form.owner} onChange={e=>field('owner',e.target.value)}><option>Você</option><option>Maria</option><option>Lucas</option><option>Ana</option></select></label><label>Prazo<input required type="date" value={form.due} onChange={e=>field('due',e.target.value)} /></label></div><div className="form-row"><label>Prioridade<select value={form.priority} onChange={e=>field('priority',e.target.value)}><option>Baixa</option><option>Média</option><option>Alta</option></select></label><label>Status<select value={form.status} onChange={e=>field('status',e.target.value)}><option value="todo">A fazer</option><option value="doing">Fazendo</option></select></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">Criar tarefa</button></div></form></div> }

import { Filter } from 'lucide-react';

function EmptyState({icon=<Filter size={22}/>,title='No data to display',text}) { return <div className="empty-state"><div className="empty-icon">{icon}</div>{title&&<h3>{title}</h3>}<p>{text}</p></div>; }

export { EmptyState };

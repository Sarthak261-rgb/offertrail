import { useDraggable } from '@dnd-kit/core';
import { Link } from 'react-router-dom';
import { describeDue, daysFromToday } from '../../utils/format.js';
import { PriorityTag } from '../ui.jsx';

export function CardContent({ card }) {
  const followUpDue = card.followUpAt && daysFromToday(card.followUpAt) <= 0;
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug text-slate-900">{card.company}</p>
        <PriorityTag priority={card.priority} />
      </div>
      <p className="mt-0.5 text-sm text-slate-600">{card.role}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {card.location && <span>{card.location}</span>}
        {card.followUpAt && !['offer', 'rejected'].includes(card.status) && (
          <span className={followUpDue ? 'font-medium text-rose-600' : ''}>
            {describeDue(card.followUpAt)}
          </span>
        )}
      </div>
    </>
  );
}

export function BoardCard({ card }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card._id,
    data: { status: card.status },
  });

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-roledescription="Draggable application"
      className={`card cursor-grab touch-none p-3 transition hover:border-indigo-300 active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      {/* The pointer sensor needs 6px of movement to start a drag, so plain clicks still open the link. */}
      <Link to={`/applications/${card._id}`} className="block focus:outline-none">
        <CardContent card={card} />
      </Link>
    </li>
  );
}

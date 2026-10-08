import { useDroppable } from '@dnd-kit/core';
import { BoardCard } from './BoardCard.jsx';

export function BoardColumn({ status, cards, onAdd }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.value });

  return (
    <section
      aria-label={`${status.label} column`}
      className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-100/80 xl:w-auto xl:min-w-0 xl:flex-1"
    >
      <header className="flex items-center justify-between px-3 pt-3 pb-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
          {status.label}
          <span className="rounded-full bg-white px-2 text-xs font-medium text-slate-500">
            {cards.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => onAdd(status.value)}
          className="rounded-md px-1.5 text-lg leading-none text-slate-400 hover:bg-white hover:text-indigo-600"
          aria-label={`Add application to ${status.label}`}
        >
          +
        </button>
      </header>

      <ul
        ref={setNodeRef}
        className={`flex min-h-32 flex-1 flex-col gap-2 rounded-b-xl p-2 transition-colors ${
          isOver ? 'bg-indigo-100/70 ring-2 ring-indigo-300 ring-inset' : ''
        }`}
      >
        {cards.map((card) => (
          <BoardCard key={card._id} card={card} />
        ))}
        {cards.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
            Drop a card here
          </li>
        )}
      </ul>
    </section>
  );
}

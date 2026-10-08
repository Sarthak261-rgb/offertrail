import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { useMoveApplication } from '../../hooks/useApplications.js';
import { STATUSES } from '../../utils/constants.js';
import { CardContent } from './BoardCard.jsx';
import { BoardColumn } from './BoardColumn.jsx';

export function KanbanBoard({ cards, onAdd }) {
  const move = useMoveApplication();
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(STATUSES.map((s) => [s.value, []]));
    for (const card of cards) grouped[card.status]?.push(card);
    return grouped;
  }, [cards]);

  function handleDragEnd({ active, over }) {
    setActiveCard(null);
    const from = active.data.current?.status;
    if (over && over.id !== from) {
      move.mutate({ id: active.id, status: over.id });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveCard(cards.find((c) => c._id === active.id) ?? null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveCard(null)}
    >
      {/* Fixed-width columns scroll horizontally until the screen is wide enough to share it. */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {STATUSES.map((status) => (
          <BoardColumn key={status.value} status={status} cards={columns[status.value]} onAdd={onAdd} />
        ))}
      </div>

      {/* Rendered outside the scroll container so the dragged card isn't clipped. */}
      <DragOverlay>
        {activeCard && (
          <div className="card w-72 rotate-2 cursor-grabbing p-3 shadow-lg ring-2 ring-indigo-400">
            <CardContent card={activeCard} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

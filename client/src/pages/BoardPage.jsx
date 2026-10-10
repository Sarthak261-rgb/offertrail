import { useOutletContext } from 'react-router-dom';
import { KanbanBoard } from '../components/board/KanbanBoard.jsx';
import { FollowUpsPanel } from '../components/FollowUpsPanel.jsx';
import { EmptyState, ErrorState, PageSpinner } from '../components/ui.jsx';
import { useBoard } from '../hooks/useApplications.js';

export function BoardPage() {
  const { openCreate } = useOutletContext();
  const { data: cards, isPending, isError, error, refetch } = useBoard();

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Board</h1>
          <p className="text-sm text-slate-500">
            Drag a card to another column to update its status.
          </p>
        </div>
      </div>

      {isPending && <PageSpinner />}
      {isError && <ErrorState error={error} onRetry={refetch} />}
      {cards?.length === 0 && (
        <EmptyState
          title="No applications yet"
          description="Add the first role you're interested in. You can drag it through the stages as things progress."
          action={
            <button type="button" className="btn btn-primary" onClick={() => openCreate()}>
              Add your first application
            </button>
          }
        />
      )}
      {cards?.length > 0 && (
        <>
          <FollowUpsPanel />
          <KanbanBoard cards={cards} onAdd={openCreate} />
        </>
      )}
    </>
  );
}

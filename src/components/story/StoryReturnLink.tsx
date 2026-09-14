import { Link } from 'react-router-dom';
import { useStoryStore } from '../../app/state/storyStore';

export function StoryReturnLink({ eraId }: { eraId: string }) {
  const branchReturn = useStoryStore((state) => state.branchReturn);
  const resumeBranch = useStoryStore((state) => state.resumeBranch);
  if (!branchReturn) return null;

  return (
    <Link className="primary-link secondary-link" to={`/map?era=${eraId}`} onClick={resumeBranch}>
      Return to guided history
    </Link>
  );
}

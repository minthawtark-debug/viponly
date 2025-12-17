import { useParams } from 'react-router-dom';
import { MemberForm } from '@/components/admin/MemberForm';

export default function MemberEdit() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gold-gradient mb-2">Edit Member</h1>
        <p className="text-muted-foreground">Update member profile information</p>
      </div>

      <div className="max-w-4xl">
        <MemberForm memberId={id} />
      </div>
    </div>
  );
}

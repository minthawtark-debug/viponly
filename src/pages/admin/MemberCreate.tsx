import { MemberForm } from '@/components/admin/MemberForm';

export default function MemberCreate() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gold-gradient mb-2">Add New Member</h1>
        <p className="text-muted-foreground">Create a new VIP club member profile</p>
      </div>

      <div className="max-w-4xl">
        <MemberForm />
      </div>
    </div>
  );
}

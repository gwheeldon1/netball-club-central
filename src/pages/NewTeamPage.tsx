
import Layout from "@/components/Layout";
import { TeamForm } from "@/components/teams/TeamForm";

const NewTeamPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Team</h1>
          <p className="text-muted-foreground">
            Add a new team to your organization
          </p>
        </div>
        
        <TeamForm />
      </div>
    </Layout>
  );
};

export default NewTeamPage;

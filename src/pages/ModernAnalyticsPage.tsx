
import Layout from "@/components/Layout";
import { ModernAnalyticsDashboard } from "@/components/analytics/ModernAnalyticsDashboard";

const ModernAnalyticsPage = () => {
  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <ModernAnalyticsDashboard />
      </div>
    </Layout>
  );
};

export default ModernAnalyticsPage;

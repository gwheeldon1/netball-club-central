
import Layout from "@/components/Layout";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

const AnalyticsPage = () => {
  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">View performance metrics and insights</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </Layout>
  );
};

export default AnalyticsPage;

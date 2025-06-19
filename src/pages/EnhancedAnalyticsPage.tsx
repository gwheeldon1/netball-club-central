
import Layout from "@/components/Layout";
import { EnhancedAnalyticsDashboard } from "@/components/analytics/EnhancedAnalyticsDashboard";

const EnhancedAnalyticsPage = () => {
  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <EnhancedAnalyticsDashboard />
      </div>
    </Layout>
  );
};

export default EnhancedAnalyticsPage;

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import EcountChatbot from "@/components/EcountChatbot";

export default function MainTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">개요</TabsTrigger>
        <TabsTrigger value="analysis">분석</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Dashboard />
      </TabsContent>

      <TabsContent value="analysis">
        <EcountChatbot />
      </TabsContent>
    </Tabs>
  );
}

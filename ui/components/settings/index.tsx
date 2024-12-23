import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DefaultSettings from './default-settings';
import { FocusModes } from './focus-modes';

export function SettingsLayout() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg dark:border-gray-800">
        <Tabs defaultValue="focus" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">通用设置</TabsTrigger>
            <TabsTrigger value="focus">专注模式</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-4">
            <DefaultSettings />
          </TabsContent>
          <TabsContent value="focus" className="mt-4">
            <FocusModes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Settings() {
  return <SettingsLayout />;
}

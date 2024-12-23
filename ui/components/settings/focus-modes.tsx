'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FocusModeList } from '@/config/focus-modes';
import { FocusMode } from '@/types/focus-modes';
import { Eye, Pencil, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FocusModeDialog } from './focus-mode-dialog';

export function FocusModes() {
  const [modes, setModes] = useState<FocusMode[]>(FocusModeList);
  const [error, setError] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState<FocusMode | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [modeToDelete, setModeToDelete] = useState<FocusMode | null>(null);

  useEffect(() => {
    // 这里需要根据实际情况设置FocusModeList
    // 例如，从API获取FocusModeList
    // 或者从本地存储中获取FocusModeList
    // 这里我们简单地设置为FocusModeList
    setModes(FocusModeList);
  }, []);

  const handleCreate = async (data: Omit<FocusMode, 'id' | 'icon'>) => {
    try {
      // 这里添加API调用逻辑
      const newMode = {
        id: Date.now().toString(),
        icon: <Eye size={20} />,
        ...data,
      };
      setModes([...modes, newMode]);
    } catch (err) {
      setError('创建Focus Mode失败');
      throw err;
    }
  };

  const handleEdit = async (data: Omit<FocusMode, 'id' | 'icon'>) => {
    try {
      // 这里添加API调用逻辑
      const updatedModes = modes.map((mode) =>
        mode.id === editingMode?.id ? { ...mode, ...data } : mode,
      );
      setModes(updatedModes);
    } catch (err) {
      setError('更新Focus Mode失败');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!modeToDelete) return;
    try {
      // 这里添加API调用逻辑
      setModes(modes.filter((mode) => mode.id !== modeToDelete.id));
      setModeToDelete(null);
    } catch (err) {
      setError('删除Focus Mode失败');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Focus Modes</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新建模式
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {modes.map((mode) => (
          <Card key={mode.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {mode.icon}
                <div>
                  <h3 className="font-semibold">{mode.name}</h3>
                  {mode.description && (
                    <p className="text-sm text-muted-foreground">
                      {mode.description}
                    </p>
                  )}
                  {mode.endpoint && (
                    <p className="text-sm text-muted-foreground">
                      {mode.endpoint}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingMode(mode);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setModeToDelete(mode);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <FocusModeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        title="创建新的Focus Mode"
      />

      <FocusModeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode={editingMode}
        onSubmit={handleEdit}
        title="编辑Focus Mode"
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个Focus Mode吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

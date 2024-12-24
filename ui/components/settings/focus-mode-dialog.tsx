'use client';

import { SpinnerButton } from '@/components/common/buttons';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DefaultFocusMode, FocusMode } from '@/types/focus-modes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// 定义验证schema
const formSchema = z.object({
  name: z.string().min(1, '请输入模式名称').max(50, '名称不能超过50个字符'),
  description: z.string().max(200, '描述不能超过200个字符').optional(),
  endpoint: z.string().min(1, '请输入API Endpoint').url('请输入有效的URL地址'),
});

type FormData = z.infer<typeof formSchema>;

interface FocusModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: FocusMode;
  onSubmit: (data: Omit<FocusMode, 'id' | 'icon'>) => Promise<void>;
  title: string;
}

export function FocusModeDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
  title,
}: FocusModeDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: DefaultFocusMode,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      reset(mode || DefaultFocusMode);
    }
  }, [open, mode, reset]);

  const onSubmitForm = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      if (data.name === 'error') {
        throw new Error('提交表单时出错');
      }

      setTimeout(async () => {
        onOpenChange(false);
        await onSubmit(data);
      }, 1000);
    } catch (err: any) {
      toast.error(err.message);
    }
    setTimeout(async () => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Input
                placeholder="模式名称"
                {...register('name')}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Textarea
                placeholder="描述（可选）"
                {...register('description')}
                className={cn(errors.description && 'border-red-500')}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Input
                placeholder="API Endpoint"
                {...register('endpoint')}
                className={cn(errors.endpoint && 'border-red-500')}
              />
              {errors.endpoint && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.endpoint.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <SpinnerButton
              type="submit"
              loading={isSubmitting}
              loadingText="保存中..."
              defaultText="保存"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

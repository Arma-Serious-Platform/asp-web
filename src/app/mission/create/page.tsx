'use client';

import { Layout } from '@/widgets/layout';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import { Card } from '@/shared/ui/atoms/card';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreateMissionDto } from '@/shared/sdk/types';
import { api } from '@/shared/sdk';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';
import { LoaderIcon, UploadIcon } from 'lucide-react';
import Image from 'next/image';

const schema = yup.object().shape({
  title: yup.string().required("Назва є обов'язковою"),
  description: yup.string().required("Опис є обов'язковим"),
});

export default function CreateMissionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<CreateMissionDto>({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const { isValid } = form.formState;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CreateMissionDto) => {
    try {
      setIsSubmitting(true);
      const response = await api.createMission({
        ...data,
        image: imageFile || undefined,
      });
      router.push(ROUTES.missions.id(response.data.id));
    } catch (error) {
      console.error('Failed to create mission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout showHero={false}>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold leading-tight tracking-tight text-white mb-2'>
              Створити місію
            </h1>
            <p className='text-zinc-400'>
              Заповніть форму для створення нової місії
            </p>
          </div>

          <Card className='p-6'>
            <form
              className='flex flex-col gap-6'
              onSubmit={form.handleSubmit(onSubmit)}>
              {/* Image Upload */}
              <div className='flex flex-col gap-4'>
                <label className='text-sm font-semibold text-zinc-300'>
                  Зображення місії
                </label>
                <div className='flex flex-col gap-3'>
                  {imagePreview && (
                    <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10'>
                      <Image
                        src={imagePreview}
                        alt='Preview'
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/png, image/jpeg, image/jpg, image/webp, image/gif'
                    onChange={handleImageChange}
                    className='hidden'
                    id='image-upload'
                  />
                  <label htmlFor='image-upload'>
                    <Button
                      type='button'
                      variant={imageFile ? 'outline' : 'default'}
                      className='w-full'>
                      <UploadIcon className='size-4' />
                      {imageFile ? 'Змінити зображення' : 'Обрати зображення'}
                    </Button>
                  </label>
                </div>
              </div>

              {/* Title */}
              <Controller
                control={form.control}
                name='title'
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Назва місії'
                    autoFocus
                    error={form.formState.errors.title?.message}
                  />
                )}
              />

              {/* Description */}
              <Controller
                control={form.control}
                name='description'
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label='Опис місії'
                    rows={6}
                    placeholder='Опишіть місію...'
                    error={form.formState.errors.description?.message}
                  />
                )}
              />

              {/* Actions */}
              <div className='flex justify-between gap-4 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.back()}>
                  Скасувати
                </Button>
                <Button type='submit' disabled={isSubmitting || !isValid}>
                  {isSubmitting ? (
                    <>
                      <LoaderIcon className='size-4 animate-spin' />
                      Створення...
                    </>
                  ) : (
                    'Створити місію'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

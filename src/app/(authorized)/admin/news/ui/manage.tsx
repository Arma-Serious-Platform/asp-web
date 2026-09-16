'use client';

import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { LoaderIcon } from 'lucide-react';

import { ManageNewsState } from '../state/manage-news.state';
import { News, NewsType } from '@/shared/sdk/news/news.schemas';
import { newsApi } from '@/shared/sdk';
import { NEWS_TYPE_LABELS } from '@/entities/news';
import { Button } from '@/shared/ui/atoms/button';
import { Input, DateInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { Switch } from '@/shared/ui/atoms/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/organisms/dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/organisms/drawer';
import { MessageEditor } from '@/features/chat/editor';
import { MissionImageField } from '@/app/missions/ui/mission-image-field';
import { MissionCommentMessage } from '@/shared/sdk/api-model';

type ManageNewsModalProps = {
  state: ManageNewsState;
  onCreateSuccess?: (news: News) => void;
  onUpdateSuccess?: (news: News) => void;
  onDeleteSuccess?: () => void;
};

const typeOptions = Object.values(NewsType).map(value => ({
  label: NEWS_TYPE_LABELS[value],
  value,
}));

const emptyLexical = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
};

export const ManageNewsModal: FC<ManageNewsModalProps> = observer(
  ({ state, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
    const news = state.modal.payload?.news;
    const isEdit = Boolean(news?.id);

    const [title, setTitle] = useState('');
    const [type, setType] = useState<NewsType>(NewsType.INFO);
    const [published, setPublished] = useState(false);
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [shortDescription, setShortDescription] = useState<Record<string, unknown>>(emptyLexical);
    const [content, setContent] = useState<Record<string, unknown>>(emptyLexical);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    useEffect(() => {
      if (state.modal.isOpen && state.modal.payload?.mode === 'manage') {
        setTitle(news?.title ?? '');
        setType(news?.type ?? NewsType.INFO);
        setPublished(news?.published ?? false);
        setDate(news?.date ? dayjs(news.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
        setShortDescription(
          (news?.shortDescription as Record<string, unknown>) ?? emptyLexical,
        );
        setContent((news?.content as Record<string, unknown>) ?? emptyLexical);
        setImage(null);
        setImagePreview(null);
        setRemoveImage(false);
      }

      if (!state.modal.isOpen) {
        setTitle('');
        setType(NewsType.INFO);
        setPublished(false);
        setDate(dayjs().format('YYYY-MM-DD'));
        setShortDescription(emptyLexical);
        setContent(emptyLexical);
        setImage(null);
        setImagePreview(null);
        setRemoveImage(false);
      }
    }, [state.modal.isOpen, state.modal.payload?.mode, news]);

    useEffect(() => {
      if (!image) {
        setImagePreview(null);
        return;
      }
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }, [image]);

    const uploadContentImage = async (file: File) => {
      const { data } = await newsApi.uploadNewsMedia(file);
      return { url: data.url, id: data.id };
    };

    const handleSubmit = async () => {
      if (!title.trim()) return;

      if (isEdit && news?.id) {
        await state.updateNews(
          {
            id: news.id,
            title: title.trim(),
            type,
            published,
            date,
            shortDescription,
            content,
            image,
            removeImage,
          },
          onUpdateSuccess,
        );
        return;
      }

      await state.createNews(
        {
          title: title.trim(),
          type,
          published,
          date,
          shortDescription,
          content,
          image,
        },
        onCreateSuccess,
      );
    };

    return (
      <>
        <Drawer
          open={state.modal.isOpen && state.modal.payload?.mode === 'manage'}
          onOpenChange={open => !open && state.modal.close()}>
          <DrawerContent className="w-full max-w-full max-sm:w-full sm:w-[75vw] sm:max-w-[75vw]">
            <DrawerHeader>
              <DrawerTitle>{isEdit ? 'Редагувати новину' : 'Нова новина'}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Заголовок</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Заголовок новини" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Тип</label>
                  <Select
                    options={typeOptions}
                    value={type}
                    onChange={value => setType((value as NewsType) || NewsType.INFO)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Дата</label>
                  <DateInput
                    mode="date"
                    value={date}
                    onChange={e => setDate(e.target.value || dayjs().format('YYYY-MM-DD'))}
                  />
                </div>
              </div>

              <label className="flex w-fit items-center gap-3 text-sm text-zinc-200">
                <span>Опубліковано</span>
                <Switch checked={published} onCheckedChange={setPublished} />
              </label>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Обкладинка</label>
                <MissionImageField
                  previewUrl={imagePreview}
                  existingUrl={removeImage ? null : news?.image?.url}
                  onCropped={file => {
                    setImage(file);
                    setRemoveImage(false);
                  }}
                />
                {(news?.image?.url || image) && !removeImage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="w-fit"
                    onClick={() => {
                      setImage(null);
                      setRemoveImage(true);
                    }}>
                    Прибрати зображення
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Короткий опис</label>
                <MessageEditor
                  key={`short-${news?.id ?? 'new'}-${state.modal.isOpen}`}
                  initialState={shortDescription as MissionCommentMessage}
                  placeholder="Короткий опис..."
                  maxCharacters={1000}
                  showSubmit={false}
                  textFormattingOnly
                  onChange={({ lexicalState }) => setShortDescription(lexicalState)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Контент</label>
                <MessageEditor
                  key={`content-${news?.id ?? 'new'}-${state.modal.isOpen}`}
                  className="min-h-[280px]"
                  initialState={content as MissionCommentMessage}
                  placeholder="Текст новини..."
                  maxCharacters={20000}
                  showSubmit={false}
                  allowLists
                  allowImages
                  onUploadImage={uploadContentImage}
                  onChange={({ lexicalState }) => setContent(lexicalState)}
                />
              </div>
            </DrawerBody>
            <DrawerFooter className="border-t border-white/10 pt-4">
              <Button variant="outline" onClick={() => state.modal.close()} disabled={state.loader.isLoading}>
                Скасувати
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={state.loader.isLoading || !title.trim()}>
                {state.loader.isLoading && <LoaderIcon className="size-4 animate-spin" />}
                {isEdit ? 'Зберегти' : 'Створити'}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Dialog
          open={state.modal.isOpen && state.modal.payload?.mode === 'delete'}
          onOpenChange={open => !open && state.modal.close()}>
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>Видалити новину</DialogTitle>
              <DialogDescription>
                Ви впевнені, що хочете видалити «{news?.title}»? Цю дію не можна скасувати.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button
                variant="destructive"
                disabled={state.loader.isLoading}
                onClick={() => news?.id && void state.deleteNews(news.id, onDeleteSuccess)}>
                Видалити
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

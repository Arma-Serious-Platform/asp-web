'use client';

import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { LoaderIcon, UploadIcon } from 'lucide-react';

import { session } from '@/entities/session/model';
import { api } from '@/shared/sdk';
import { Squad, UpdateMySquadDto } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Switch } from '@/shared/ui/atoms/switch';
import { resolveUploadFileFromInput } from '@/shared/utils/file';

type UpdateMySquadFormProps = {
  squad: Squad;
  onUpdated?: (squad: Squad) => void | Promise<void>;
};

export const UpdateMySquadForm: FC<UpdateMySquadFormProps> = ({ squad, onUpdated }) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(squad.name);
  const [tag, setTag] = useState(squad.tag);
  const [activeCount, setActiveCount] = useState(squad.activeCount?.toString() ?? '0');
  const [recruiting, setRecruiting] = useState(Boolean(squad.recruiting));
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(squad.name);
    setTag(squad.tag);
    setActiveCount(squad.activeCount?.toString() ?? '0');
    setRecruiting(Boolean(squad.recruiting));
    setLogo(null);
    setLogoPreview('');
  }, [squad]);

  useEffect(() => {
    if (!logo) {
      setLogoPreview('');
      return;
    }

    const url = URL.createObjectURL(logo);
    setLogoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [logo]);

  const isValid = Boolean(name.trim() && tag.trim());

  const handleSubmit = async () => {
    if (!isValid) return;

    const nextActiveCount = Number(activeCount || 0);
    const dto: UpdateMySquadDto = {};

    if (name.trim() !== squad.name) dto.name = name.trim();
    if (tag.trim() !== squad.tag) dto.tag = tag.trim();
    if (nextActiveCount !== squad.activeCount) dto.activeCount = nextActiveCount;
    if (recruiting !== Boolean(squad.recruiting)) dto.recruiting = recruiting;
    if (logo) dto.logo = logo;

    if (!Object.keys(dto).length) {
      toast('Немає змін для збереження');
      return;
    }

    try {
      setIsSaving(true);
      const { data } = await api.updateMySquad(dto);

      toast.success('Загін оновлено');
      await session.fetchMe();
      await onUpdated?.(data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося оновити загін';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const logoSrc = logoPreview || squad.logo?.url || '/images/logo.webp';

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-4">
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-white">Налаштування загону</div>
        <p className="text-xs text-zinc-500">Ці поля може змінювати тільки лідер загону.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <input
            ref={logoInputRef}
            className="hidden"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            disabled={isSaving}
            onChange={event => setLogo(resolveUploadFileFromInput(event.target.files?.[0], event.currentTarget))}
          />
          <div className="overflow-hidden rounded-lg border border-white/10 bg-black/70">
            <Image
              src={logoSrc}
              alt={squad.name}
              width={96}
              height={96}
              className="size-24 object-cover"
              unoptimized={!logoSrc.startsWith('https')}
            />
          </div>
          <Button type="button" size="sm" variant="outline" disabled={isSaving} onClick={() => logoInputRef.current?.click()}>
            <UploadIcon className="size-4" />
            Змінити лого
          </Button>
        </div>

        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
          <Input label="Назва загону" value={name} disabled={isSaving} onChange={event => setName(event.target.value)} />
          <Input label="Тег загону" value={tag} disabled={isSaving} onChange={event => setTag(event.target.value)} />
          <NumericInput
            label="Активних учасників"
            value={activeCount}
            disabled={isSaving}
            onChange={event => setActiveCount(event.target.value)}
          />
          <label className="flex h-9 items-center justify-between rounded-md border border-neutral-700 bg-black/70 px-3 text-sm text-zinc-100">
            <span>Набір у загін</span>
            <Switch checked={recruiting} disabled={isSaving} onCheckedChange={setRecruiting} />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" disabled={isSaving || !isValid} onClick={handleSubmit}>
          {isSaving && <LoaderIcon className="size-4 animate-spin" />}
          Зберегти зміни
        </Button>
      </div>
    </div>
  );
};

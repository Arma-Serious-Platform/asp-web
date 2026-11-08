'use client';

import { FC } from 'react';
import { Controller, useFieldArray, UseFormReturn } from 'react-hook-form';
import { GripVerticalIcon, MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MissionGameSide } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { VersionFormData } from '../state/create-update-version.state';

type WeaponryFieldName = 'attackWeaponry' | 'defenseWeaponry' | 'friendlyWeaponry';

type SortableWeaponryItemProps = {
  id: string;
  index: number;
  form: UseFormReturn<VersionFormData>;
  name: WeaponryFieldName;
  onRemove: () => void;
};

const SortableWeaponryItem: FC<SortableWeaponryItemProps> = ({ id, index, form, name, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 p-3 rounded-lg border border-white/10 bg-black/40">
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label="Перетягнути"
          {...attributes}
          {...listeners}
          className="mt-7 cursor-grab touch-none text-neutral-400 hover:text-neutral-200 active:cursor-grabbing">
          <GripVerticalIcon className="size-5" />
        </button>
        <div className="flex-1 flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Controller
              control={form.control}
              name={`${name}.${index}.name`}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Назва"
                  placeholder="Назва озброєння"
                  error={form.formState.errors[name]?.[index]?.name?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name={`${name}.${index}.description`}
              render={({ field }) => <Input {...field} label="Опис (опційно)" placeholder="Опис озброєння" />}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Controller
              control={form.control}
              name={`${name}.${index}.count`}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Кількість</label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        const current = field.value || 1;
                        field.onChange(Math.max(1, current - 1));
                      }}>
                      <MinusIcon className="size-3" />
                    </Button>
                    <NumericInput
                      {...field}
                      value={field.value || ''}
                      onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      className="w-20"
                      min={1}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        const current = field.value || 1;
                        field.onChange(current + 1);
                      }}>
                      <PlusIcon className="size-3" />
                    </Button>
                  </div>
                </div>
              )}
            />
            <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0 mt-5 ml-auto" onClick={onRemove}>
              <TrashIcon className="size-4 text-red-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

type WeaponryFieldListProps = {
  form: UseFormReturn<VersionFormData>;
  name: WeaponryFieldName;
  title: string;
  /** Side assigned to newly added rows. Adding is disabled while it is empty. */
  sideType: MissionGameSide | '' | null;
};

export const WeaponryFieldList: FC<WeaponryFieldListProps> = ({ form, name, title, sideType }) => {
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name, keyName: '_fieldId' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field._fieldId === active.id);
      const newIndex = fields.findIndex(field => field._fieldId === over.id);

      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-300">{title}</h4>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(field => field._fieldId)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableWeaponryItem
              key={field._fieldId}
              id={field._fieldId}
              index={index}
              form={form}
              name={name}
              onRemove={() => remove(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!sideType}
        onClick={() => {
          if (!sideType) return;
          append({ name: '', description: '', count: 1, type: sideType });
        }}>
        <PlusIcon className="size-3" />
        Додати
      </Button>
    </div>
  );
};

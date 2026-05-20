'use client';

import { session } from '@/entities/session/model';
import {
  cloneRuleSections,
  DEFAULT_RULE_SECTIONS,
  parseRuleSections,
  RuleSection,
  serializeRuleSections,
} from '@/app/rules/data';
import { api } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import { AdminSidebar } from '@/widgets/admin/sidebar';
import { useAdminRouteGuard } from '@/widgets/admin/sidebar/hooks/use-tech-admin-routes-guard';
import { Layout } from '@/widgets/layout';
import { LoaderIcon, RotateCcwIcon, SaveIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const AdminRulesPage = observer(() => {
  useAdminRouteGuard(session.canManageRules);

  const [sections, setSections] = useState<RuleSection[]>(() => cloneRuleSections());
  const [activeSectionId, setActiveSectionId] = useState(DEFAULT_RULE_SECTIONS[0]?.id ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeSection = useMemo(
    () => sections.find(section => section.id === activeSectionId) ?? sections[0],
    [activeSectionId, sections],
  );

  useEffect(() => {
    const loadRules = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.getRules();
        const parsedSections = parseRuleSections(data.content);

        setSections(parsedSections);
        setActiveSectionId(parsedSections[0]?.id ?? '');
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити правила');
        setSections(cloneRuleSections());
      } finally {
        setIsLoading(false);
      }
    };

    loadRules();
  }, []);

  const updateActiveSectionTitle = (title: string) => {
    setSections(currentSections =>
      currentSections.map(section => (section.id === activeSection?.id ? { ...section, title } : section)),
    );
  };

  const updateRuleItem = (itemId: string, text: string) => {
    setSections(currentSections =>
      currentSections.map(section =>
        section.id === activeSection?.id
          ? {
              ...section,
              items: section.items.map(item => (item.id === itemId ? { ...item, text } : item)),
            }
          : section,
      ),
    );
  };

  const resetToOriginal = () => {
    const originalSections = cloneRuleSections();

    setSections(originalSections);
    setActiveSectionId(originalSections[0]?.id ?? '');
  };

  const saveRules = async () => {
    try {
      setIsSaving(true);
      const { data } = await api.updateRules({ content: serializeRuleSections(sections) });
      const parsedSections = parseRuleSections(data.content);

      setSections(parsedSections);
      setActiveSectionId(activeSection?.id ?? parsedSections[0]?.id ?? '');
      toast.success('Правила збережено');
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося зберегти правила');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout className="flex w-full mt-10 container mx-auto h-full">
      <div className="flex flex-col bg-card w-full p-4">
        <AdminSidebar className="mb-4" />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Правила</h1>
            <p className="text-sm text-zinc-400">Оберіть розділ зліва і редагуйте його пункти окремо.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" disabled={isLoading || isSaving} onClick={resetToOriginal}>
              <RotateCcwIcon className="size-4" />
              Оригінал
            </Button>
            <Button disabled={isLoading || isSaving} onClick={saveRules}>
              {isSaving ? <LoaderIcon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              Зберегти
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto rounded-md border border-white/10 p-2">
            {sections.map(section => (
              <button
                type="button"
                className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  section.id === activeSection?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
                disabled={isLoading || isSaving}
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}>
                {section.title}
              </button>
            ))}
          </div>

          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto rounded-md border border-white/10 p-4">
            {activeSection && (
              <>
                <Input
                  label="Назва розділу"
                  disabled={isLoading || isSaving}
                  value={activeSection.title}
                  onChange={event => updateActiveSectionTitle(event.target.value)}
                />

                {activeSection.items.map(item => (
                  <Textarea
                    key={item.id}
                    label={`Пункт ${item.id}`}
                    className="min-h-28"
                    disabled={isLoading || isSaving}
                    value={item.text}
                    onChange={event => updateRuleItem(item.id, event.target.value)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
});

export default AdminRulesPage;

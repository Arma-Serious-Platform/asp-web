import { Button } from '@/shared/ui/atoms/button';
import { CodeCopy } from '@/shared/ui/organisms/code-copy';
import { cn } from '@/shared/utils/cn';
import { DownloadIcon } from 'lucide-react';

import { FC } from 'react';

const InstallationGuide: FC<{
  className?: string;
}> = ({ className }) => {
  const steps: { title: string; description: React.ReactNode }[] = [
    {
      title: 'Завантажте Resilio Sync',
      description: (
        <p>
          Перейдіть на офіційний сайт{' '}
          <a
            className="text-primary hover:underline"
            href="https://www.resilio.com/individuals/"
            target="_blank"
            rel="noopener noreferrer">
            Resilio Sync
          </a>{' '}
          та встановіть програму
        </p>
      ),
    },
    {
      title: 'Додайте роздачу модів',
      description: (
        <p>
          Натисніть на плюсик у верхньому лівому куті Resilio Sync і виберіть
          <b> "Ввести ключ або посилання"</b>. Введіть ключ моду.
          <br />
          <br />
          Рекомендуємо створити теку для всіх модів, які додаються через ключі (Наприклад: VTG Pack). У цій теці
          створюйте підтеки з назвами:
          <br />
          "VTG Core", "VTG Mods", "VTG BW" та "VTG Maps" <b>під кожний окремий ключ</b>.
        </p>
      ),
    },
    {
      title: 'Налаштуйте параметри',
      description: (
        <p>
          Правою кнопкою миші на роздачі оберіть <b>"Налаштування"</b>.<br />
          Зніміть галочку з <b>"Зберігати видалені файли в архіві"</b> та поставте галочку на{' '}
          <b>"Перезаписувати змінені файли"</b>.
        </p>
      ),
    },
    {
      title: 'Додайте моди до Arma 3',
      description: (
        <p>
          Відкрийте лаунчер Arma 3, перейдіть в <b>"Mods"</b> та додайте завантажені моди через <b>"Local Mods"</b>.
        </p>
      ),
    },
    {
      title: 'Встановіть моди зі Steam Workshop',
      description: (
        <p>
          Завантажте моди зі{' '}
          <a
            className="text-primary hover:underline"
            href="https://steamcommunity.com/sharedfiles/filedetails/?id=3105364650">
            Steam Workshop
          </a>
        </p>
      ),
    },
  ];

  return (
    <div className={cn('flex flex-col gap-10', className)}>
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-4">
          <div className="bg-primary rounded-full size-10 flex items-center justify-center text-2xl font-bold shrink-0">
            {index + 1}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <div>{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const InstallationGuideLinks: FC<{
  className?: string;
}> = ({ className }) => {
  const links: { title: string; href: string }[] = [
    {
      title: 'CUP Terrain - Core',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=583496184',
    },
    {
      title: 'CUP Terrain - Maps',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=583544987',
    },
    {
      title: 'CUP Terrain - Maps 2.0',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1981964169',
    },
    {
      title: 'RHSAFRF',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=843425103',
    },
    {
      title: 'RHSUSAF',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=843577117',
    },
    {
      title: 'RHSGREF',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=843593391',
    },
    {
      title: 'RHSSAF',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=843632231',
    },
    {
      title: 'JSRS SOUNDMOD (опційно)',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3407948300',
    },
    {
      title: 'Українська локалізація (опційно)',
      href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1972553686',
    },
  ];

  const copyLinks: { title: string; copy: string }[] = [
    {
      title: 'VTG Core [Resilio Sync]',
      copy: 'BAS6RWNNWSIBGMQYHXGTEKCOSMY3RFC4B',
    },
    {
      title: 'VTG Maps [Resilio Sync]',
      copy: 'BYWUG6X57POZVB7XQMJ4N6UNLUYYMF4PE',
    },
    {
      title: 'VTG Mods [Resilio Sync]',
      copy: 'B6C22A7XUCYUMIW77NAOSNXP4WJYBVNXY',
    },
    {
      title: 'VTG BW [Resilio Sync]',
      copy: 'BCNBSEE5BORY3MB2AAHRMZRZNEWS73VSH',
    },
  ];

  return (
    <div className={cn('flex flex-col gap-4 w-full text-lg', className)}>
      <div className="flex flex-col gap-4">
        {links.map(link => (
          <a key={link.title} href={link.href} className="w-fit" target="_blank" rel="noopener noreferrer">
            <Button size="sm">{link.title}</Button>
          </a>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {copyLinks.map(copy => (
          <div key={copy.title}>
            <p>{copy.title}</p>
            <CodeCopy string={copy.copy} />
          </div>
        ))}
      </div>
    </div>
  );
};

const TeamSpeakGuide: FC<{ className?: string }> = ({ className }) => {
  const steps: { title: string; description: React.ReactNode }[] = [
    {
      title: 'Завантажте TeamSpeak 3',
      description: (
        <p>
          Перейдіть на офіційний сайт{' '}
          <a
            href="https://teamspeak.com/en/downloads/#ts3client"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer">
            TeamSpeak 3
          </a>{' '}
          для завантаження та встановлення програми.
        </p>
      ),
    },
    {
      title: 'Встановіть плагін Task Force Radio',
      description: (
        <div className="flex flex-col gap-2">
          <p>
            Після завантаження TeamSpeak 3 обов'язково встановіть плагін, який прикріплено нижче.
            <br />
            Для цього відкрийте файл за допомогою TeamSpeak 3 та виконайте встановлення.
          </p>
          <a download href="/files/task_force_radio.ts3_plugin" className="w-fit">
            <Button size="sm">
              <DownloadIcon className="size-4" /> Завантажити плагін рації
            </Button>
          </a>
        </div>
      ),
    },
    {
      title: 'Вимкніть плагін Overwolf',
      description: (
        <p>
          Вимкніть або видаліть плагін Overwolf у TeamSpeak 3. Використання цього плагіну заборонено правилами проекту!
        </p>
      ),
    },
    {
      title: 'Підключення до серверу TeamSpeak 3',
      description: (
        <p>
          При підключенні до серверу проекту в TeamSpeak 3, використовуйте нікнейм, який відповідає вашому нікнейму в
          Discord. <br />
          <br />
          <b>TeamSpeak IP:</b> <span className="text-primary">vtgarma3</span>
        </p>
      ),
    },
  ];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-4">
          <div className="bg-primary rounded-full size-10 flex items-center justify-center text-2xl font-bold shrink-0">
            {index + 1}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <div>{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { InstallationGuide, TeamSpeakGuide, InstallationGuideLinks };

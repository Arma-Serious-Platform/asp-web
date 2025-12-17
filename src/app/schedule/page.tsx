'use client';

import { Layout } from '@/widgets/layout';
import { Hero } from '@/widgets/hero';
import { Section } from '@/shared/ui/organisms/section';
import { dummyAnnouncements } from '@/features/weekend/model';
import { GameAnnouncement } from '@/features/weekend/model';
import { FC, useState } from 'react';
import { Button } from '@/shared/ui/atoms/button';
import {
  CarIcon,
  EyeIcon,
  DownloadIcon,
  UsersIcon,
  InfoIcon,
  UserIcon,
  CalendarIcon,
} from 'lucide-react';
import classNames from 'classnames';

const AnnouncementTab: FC<{
  announcement: GameAnnouncement;
  index: number;
  isActive: boolean;
  onClick: () => void;
  isLast: boolean;
}> = ({ announcement, index, isActive, onClick, isLast }) => (
  <div className='relative flex'>
    <button
      onClick={onClick}
      className={classNames(
        'px-4 py-2 text-sm font-medium transition-colors border-b-2 relative z-10',
        {
          'bg-lime-700 text-white border-lime-600': isActive,
          'bg-neutral-800 text-white border-transparent hover:bg-neutral-700':
            !isActive,
        }
      )}>
      {announcement.title}
    </button>
    {isActive && !isLast && (
      <div className='absolute right-0 top-0 bottom-0 w-[1px] bg-lime-600 z-20' />
    )}
  </div>
);

const AnnouncementDetails: FC<{ announcement: GameAnnouncement }> = ({
  announcement,
}) => {
  const { side1, side2 } = announcement.combatants;

  return (
    <div className='flex flex-col gap-5'>
      {/* Title */}
      <h2 className='text-2xl font-bold text-white'>{announcement.title}</h2>

      {/* Date */}
      <div className='flex items-center gap-2 text-sm text-zinc-400'>
        <CalendarIcon className='size-4' />
        <span>{announcement.date}</span>
      </div>

      {/* Combatants */}
      <div className='flex items-center gap-3'>
        <UsersIcon className='size-4 text-zinc-400 shrink-0' />
        <div className='flex items-center gap-2 flex-wrap text-sm'>
          <span
            className={classNames('font-semibold', {
              'text-red-500': side1.color === 'red',
              'text-blue-500': side1.color === 'blue',
            })}>
            {side1.name} ({side1.playerCount},{' '}
            {side1.role === 'attack' ? 'атака' : 'оборона'})
          </span>
          <span className='text-zinc-400'>vs</span>
          <span
            className={classNames('font-semibold', {
              'text-red-500': side2.color === 'red',
              'text-blue-500': side2.color === 'blue',
            })}>
            {side2.name} ({side2.playerCount},{' '}
            {side2.role === 'attack' ? 'атака' : 'оборона'})
          </span>
        </div>
      </div>

      {/* Unit Lists */}
      <div className='flex items-start gap-3'>
        <CarIcon className='size-4 text-zinc-400 mt-1 shrink-0' />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
          {/* Side 1 Units */}
          <div className='flex flex-col gap-1.5'>
            {side1.units.map((unit, idx) => (
              <div key={idx}>
                <span className='text-white'>{unit.name}</span>
                {unit.details && (
                  <span className='text-zinc-400 ml-1'>{unit.details}</span>
                )}
                <span
                  className={classNames('ml-2 font-semibold', {
                    'text-red-500': side1.color === 'red',
                    'text-blue-500': side1.color === 'blue',
                  })}>
                  {unit.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Side 2 Units */}
          <div className='flex flex-col gap-1.5'>
            {side2.units.map((unit, idx) => (
              <div key={idx}>
                <span className='text-white'>{unit.name}</span>
                {unit.details && (
                  <span className='text-zinc-400 ml-1'>{unit.details}</span>
                )}
                <span
                  className={classNames('ml-2 font-semibold', {
                    'text-red-500': side2.color === 'red',
                    'text-blue-500': side2.color === 'blue',
                  })}>
                  {unit.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className='flex items-start gap-3'>
        <InfoIcon className='size-4 text-zinc-400 mt-1 shrink-0' />
        <p className='text-sm text-zinc-200 leading-relaxed'>
          {announcement.description}
        </p>
      </div>

      {/* Author */}
      <div className='flex items-center gap-3'>
        <UserIcon className='size-4 text-zinc-400 shrink-0' />
        <div className='flex items-center gap-2'>
          <span className='text-red-500 font-semibold text-sm'>
            {announcement.author.tag}
          </span>
          <span className='text-white text-sm'>{announcement.author.name}</span>
        </div>
      </div>
    </div>
  );
};

export default function SchedulePage() {
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);
  const activeAnnouncement = dummyAnnouncements[activeAnnouncementIndex];

  return (
    <Layout>
      <Section
        id='announcements'
        eyebrow='Анонси'
        title='Розклад ігор'
        background={false}>
        {/* Navigation Tabs */}
        <div className='w-full bg-neutral-800/90 border border-white/10 rounded-t-lg mb-0'>
          <div className='px-4'>
            <div className='flex gap-0 overflow-x-auto'>
              {dummyAnnouncements.map((announcement, index) => (
                <AnnouncementTab
                  key={announcement.id}
                  announcement={announcement}
                  index={index}
                  isActive={activeAnnouncementIndex === index}
                  isLast={index === dummyAnnouncements.length - 1}
                  onClick={() => setActiveAnnouncementIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='w-full bg-gradient-to-br from-black/95 via-black/90 to-black/95 py-6 rounded-b-lg border border-t-0 border-white/10'>
          <div className='container mx-auto px-4'>
            <div className='paper rounded-xl p-5 md:p-6'>
              <div className='flex flex-col lg:flex-row gap-5 lg:gap-6'>
                {/* Left Panel - Image and Actions */}
                <div className='lg:w-2/5 flex flex-col gap-3'>
                  <div className='relative w-full aspect-video overflow-hidden rounded-lg border border-white/10'>
                    <img
                      src={activeAnnouncement.image}
                      alt={activeAnnouncement.title}
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-3'>
                    <Button
                      variant='secondary'
                      size='sm'
                      className='flex-1'
                      onClick={() => {
                        console.log('View announcement:', activeAnnouncement.id);
                      }}>
                      <EyeIcon className='size-4' />
                      Переглянути
                    </Button>
                    <Button
                      variant='secondary'
                      size='sm'
                      className='flex-1'
                      onClick={() => {
                        console.log(
                          'Download announcement:',
                          activeAnnouncement.id
                        );
                      }}>
                      <DownloadIcon className='size-4' />
                      Завантажити
                    </Button>
                  </div>
                </div>

                {/* Right Panel - Announcement Details */}
                <div className='lg:w-3/5'>
                  <AnnouncementDetails announcement={activeAnnouncement} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}

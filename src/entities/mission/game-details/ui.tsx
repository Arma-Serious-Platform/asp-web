import { FC } from 'react';
import { WeekendGame } from '@/features/weekend/model';
import {
  CarIcon,
  UsersIcon,
  InfoIcon,
  UserIcon,
  CalendarIcon,
} from 'lucide-react';
import classNames from 'classnames';

export const GameDetails: FC<{ game: WeekendGame }> = ({ game }) => {
  const { side1, side2 } = game.combatants;

  return (
    <div className='flex flex-col gap-6'>
      {/* Title */}
      <h2 className='text-3xl font-bold text-white'>{game.title}</h2>

      {/* Date */}
      {game.gameDate && (
        <div className='flex items-center gap-2 text-sm text-zinc-400'>
          <CalendarIcon className='size-4' />
          <span>{game.gameDate}</span>
        </div>
      )}

      {/* Combatants */}
      <div className='flex items-center gap-3'>
        <UsersIcon className='size-5 text-zinc-400' />
        <div className='flex items-center gap-2 flex-wrap'>
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
        <CarIcon className='size-5 text-zinc-400 mt-1' />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Side 1 Units */}
          <div className='flex flex-col gap-2'>
            {side1.units.map((unit, idx) => (
              <div key={idx} className='text-sm'>
                <span className='text-white'>
                  {unit.quantity}x {unit.name}
                </span>
                {unit.details && (
                  <span className='text-zinc-400'>({unit.details})</span>
                )}
              </div>
            ))}
          </div>

          {/* Side 2 Units */}
          <div className='flex flex-col gap-2'>
            {side2.units.map((unit, idx) => (
              <div key={idx} className='text-sm'>
                <span className='text-white'>
                  {unit.quantity}x {unit.name}
                </span>
                {unit.details && (
                  <span className='text-zinc-400'>({unit.details})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className='flex items-start gap-3'>
        <InfoIcon className='size-5 text-zinc-400 mt-1' />
        <p className='text-sm text-zinc-200 leading-relaxed'>{game.description}</p>
      </div>

      {/* Author */}
      <div className='flex items-center gap-3'>
        <UserIcon className='size-5 text-zinc-400' />
        <div className='flex items-center gap-2'>
          <span className='text-red-500 font-semibold'>{game.author.tag}</span>
          <span className='text-white'>{game.author.name}</span>
        </div>
      </div>
    </div>
  );
};


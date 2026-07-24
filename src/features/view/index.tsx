import type { FC, PropsWithChildren, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';

import { session } from '@/entities/session/model';
import { hasAnyRole } from '@/entities/user/lib';
import { UserRole } from '@/shared/sdk/types';

type ConditionProps = PropsWithChildren<{
  if: unknown;
  else?: ReactNode;
}>;

const Condition: FC<ConditionProps> = ({ if: condition, children, else: elseNode = null }) => {
  if (condition) {
    return <>{children}</>;
  }

  return elseNode;
};

type RoleProps = PropsWithChildren<{
  if?: unknown;
  role: UserRole | UserRole[];
}>;

const Role: FC<RoleProps> = observer(({ role, children, if: condition = true }) => {
  if (!session.user.user || !condition) return null;

  const allowed = Array.isArray(role) ? role : [role];
  const isMatch = hasAnyRole(session.user.user.roles, allowed);

  if (!isMatch) return null;

  return children;
});

const View = {
  Condition,
  Role,
};

export { View };

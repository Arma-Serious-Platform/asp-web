import type { FC, PropsWithChildren, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';

import { session } from '@/entities/session/session.state';
import { UserModel } from '@/entities/user/user.model';
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
  if (!session.user?.data || !condition) return null;

  const allowed = Array.isArray(role) ? role : [role];
  const isMatch = UserModel.hasAnyRole(session.user?.data.roles, allowed);

  if (!isMatch) return null;

  return children;
});

const View = {
  Condition,
  Role,
};

export { View };

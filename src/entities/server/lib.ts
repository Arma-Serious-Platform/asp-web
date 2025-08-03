import { ServerStatus } from "@/shared/sdk/types";

export const getServerStatusText = (status: ServerStatus) => {
  switch (status) {
    case ServerStatus.ACTIVE:
      return 'Активний';
    case ServerStatus.INACTIVE:
      return 'Не активний';
    default:
      return '';
  }
};


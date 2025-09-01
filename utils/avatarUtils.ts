export const getAvatarImage = (index: number) => {
  switch (index) {
    case 1:
      return require('../../assets/avatar/avatar-1.webp');
    case 2:
      return require('../../assets/avatar/avatar-3.webp');
    case 3:
      return require('../../assets/avatar/avatar-4.webp');
    case 4:
      return require('../../assets/avatar/avatar-5.webp');
    case 5:
      return require('../../assets/avatar/avatar-6.webp');
    case 6:
      return require('../../assets/avatar/avatar-7.webp');
    default:
      return require('../../assets/avatar/avatar-2.webp');
  }
};

export const getTotalAvatars = (): number => {
  return 7;
};

export const getAvatarIndices = (): number[] => {
  return [0, 1, 2, 3, 4, 5, 6];
};

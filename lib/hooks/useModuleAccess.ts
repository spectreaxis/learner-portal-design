import { useLearnerProgress } from './useLearner';
import { useModules } from './useModules';

/**
 * Hook to check if a module is accessible based on prerequisites
 */
export function useModuleAccess(moduleNumber: number) {
  const { data: learnerData } = useLearnerProgress();
  const { data: modules = [] } = useModules();

  // Module 1 is always accessible
  if (moduleNumber === 1) {
    return {
      isAccessible: true,
      isLocked: false,
      reason: null,
      progress: getModuleProgress(1, learnerData, modules),
      hasCertificate: hasModuleCertificate(1, learnerData),
    };
  }

  // For Module 2+, check if previous module is complete
  const previousModuleNumber = moduleNumber - 1;
  const previousModule = modules.find(m => m.number === previousModuleNumber);

  if (!previousModule) {
    return {
      isAccessible: false,
      isLocked: true,
      reason: 'Previous module not found',
      progress: 0,
      hasCertificate: false,
    };
  }

  // Check if previous module is 100% complete
  const previousProgress = getModuleProgress(previousModuleNumber, learnerData, modules);
  const hasPreviousCertificate = hasModuleCertificate(previousModuleNumber, learnerData);

  const isComplete = previousProgress >= 100 && hasPreviousCertificate;

  return {
    isAccessible: isComplete,
    isLocked: !isComplete,
    reason: !isComplete
      ? `Complete Module ${previousModuleNumber} and earn the certificate to unlock`
      : null,
    progress: getModuleProgress(moduleNumber, learnerData, modules),
    hasCertificate: hasModuleCertificate(moduleNumber, learnerData),
    previousModuleProgress: previousProgress,
    hasPreviousCertificate,
  };
}

/**
 * Calculate progress for a specific module
 */
function getModuleProgress(
  moduleNumber: number,
  learnerData: any,
  modules: any[]
): number {
  const module = modules.find(m => m.number === moduleNumber);
  if (!module) return 0;

  const moduleLessons = module.lessons?.length || 0;
  if (moduleLessons === 0) return 0;

  const completedInModule = learnerData?.progress?.filter(
    (p: any) => p.lesson?.moduleId === module.id && p.completed
  ).length || 0;

  return Math.round((completedInModule / moduleLessons) * 100);
}

/**
 * Check if user has certificate for a specific module
 */
function hasModuleCertificate(
  moduleNumber: number,
  learnerData: any
): boolean {
  if (!learnerData?.certificates) return false;

  return learnerData.certificates.some((cert: any) => {
    // Match by module number (assuming certificate.module.number exists)
    // or by moduleId
    return cert.module?.number === moduleNumber;
  });
}

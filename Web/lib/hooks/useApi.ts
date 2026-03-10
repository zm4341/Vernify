/**
 * API 调用 Hooks（按领域拆分，此处统一 re-export 保持 @/lib/hooks/useApi 引用不变）
 */
export {
  useCourses,
  useCourse,
  useCourseLessons,
  useCourseQuestions,
  type CourseQuestion,
} from '@/lib/course';

export {
  useLesson,
  useLessonQuestions,
  useSubmitAnswer,
  useSubmitBatch,
  useMySubmissions,
  useCourseProgress,
} from '@/lib/quiz';

export {
  usePendingGradings,
  useReviewGrading,
  useGradingStats,
} from '@/lib/grading';

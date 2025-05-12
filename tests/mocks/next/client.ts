// Mock implementation of Next.js client module
export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  prefetch: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  pathname: "/",
  query: {},
  asPath: "/",
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
});

export const usePathname = () => "/";
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];
export const useCallback = (fn: Function) => fn;
export const useTransition = () => [false, () => {}];
export const useOptimistic = (state: any) => state;
export const useFormStatus = () => ({ pending: false });
export const useFormState = (state: any) => state;
export const useServerInsertedHTML = () => {};
export const useServerAction = () => {};
export const useServerComponent = () => {};
export const useServerContext = () => ({});
export const useServerProps = () => ({});
export const useServerQuery = () => ({});
export const useServerMutation = () => ({});
export const useServerSubscription = () => ({});
export const useServerActionHandler = () => {};
export const useServerComponentHandler = () => {};
export const useServerContextHandler = () => {};
export const useServerPropsHandler = () => {};
export const useServerQueryHandler = () => {};
export const useServerMutationHandler = () => {};
export const useServerSubscriptionHandler = () => {};

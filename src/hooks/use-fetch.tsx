import { useState } from "react";
import { toast } from "sonner";

// Define a generic type for the callback function
type FetchFunction<T, A extends unknown[]> = (...args: A) => Promise<T>;

const useFetch = <T, A extends unknown[]>(cb: FetchFunction<T, A>) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: A): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        toast.error(error.message);
      } else {
        const unknownError = new Error("An unknown error occurred");
        setError(unknownError);
        toast.error(unknownError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;

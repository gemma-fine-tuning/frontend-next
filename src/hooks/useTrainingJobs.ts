import { jobsAtom } from "@/atoms";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

export function useTrainingJobs() {
	const [state, setState] = useAtom(jobsAtom);
	const isFetching = useRef(false);
	const hasFetched = useRef(false);

	const fetchTrainingJobs = useCallback(async () => {
		if (isFetching.current) return; // Prevent concurrent calls

		try {
			isFetching.current = true;
			setState({ jobs: [], loading: true, error: null });

			const res = await fetch("/api/jobs");
			if (!res.ok) throw new Error("Failed to fetch training jobs.");

			const data = await res.json();
			setState({
				jobs: data.jobs,
				loading: false,
				error: null,
			});
		} catch (error) {
			setState({
				jobs: [],
				loading: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			isFetching.current = false;
		}
	}, [setState]);

	useEffect(() => {
		console.log("useEffect training jobs");
		// Only fetch once if we haven't fetched before and no data exists
		if (!hasFetched.current && state.jobs.length === 0 && !state.error) {
			hasFetched.current = true;
			fetchTrainingJobs();
		}
	}, [state.jobs.length, state.error, fetchTrainingJobs]);

	return { ...state, refresh: fetchTrainingJobs };
}

import { jobsAtom } from "@/atoms";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

export function useTrainingJobs() {
	const [state, setState] = useAtom(jobsAtom);
	const isFetching = useRef(false);

	useEffect(() => {
		if (state.jobs.length === 0 && !state.error && !isFetching.current) {
			isFetching.current = true;
			const fetchTrainingJobs = async () => {
				try {
					setState({ jobs: [], loading: true, error: null });

					const res = await fetch("/api/jobs");
					if (!res.ok)
						throw new Error("Failed to fetch training jobs.");

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
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
					});
				} finally {
					isFetching.current = false;
				}
			};

			fetchTrainingJobs();
		}
	}, [state, setState]);

	return state;
}

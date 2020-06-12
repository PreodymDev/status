import { useState, useEffect } from "react";
import config from "../config";

export default (label) => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // GitHub rate limiting: 60 requests per hour/unauthenticated - fetches 15 times per hour / sending 30 requests (2 requests per fetch) and caches in localStorage
    if (
      new Date(localStorage.getItem(`issueStatusLastFetch${label}`)) <
      new Date() - 180000
    ) {
      fetchData(setLoading, setError, setResults, label);
    } else {
      setResults(JSON.parse(localStorage.getItem(`issueStatus${label}`)));
      setLoading(false);
      setError();
    }
  }, []);

  return [
    loading,
    error,
    results,
    () => fetchData(setLoading, setError, setResults, label),
  ];
};

const fetchData = (setLoading, setError, setResults, label) => {
  setLoading(true);
  fetch(
    `https://api.github.com/repos/${config.user}/issue-status/issues?state=all&labels=issue status,${label}`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      localStorage.setItem(`issueStatusLastFetch${label}`, new Date());
      localStorage.setItem(`issueStatus${label}`, JSON.stringify(data));
      setResults(data);
      setLoading(false);
      setError();
    })
    .catch((error) => {
      setError(error.toString());
      setResults(JSON.parse(localStorage.getItem(`issueStatus${label}`)));
      setLoading(false);
    });
};

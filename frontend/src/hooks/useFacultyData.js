import { useCallback, useEffect, useMemo, useState } from "react";
import API, { extractApiError } from "../api/axiosInstance";
import { ROLES } from "../lib/constants";

export function useFacultyData() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/admin/faculty-list");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const departments = new Map();

    users.forEach((user) => {
      const key = user.department || "Unassigned";
      departments.set(key, (departments.get(key) ?? 0) + 1);
    });

    const roles = Object.values(ROLES).map((role) => ({
      label: role,
      value: users.filter((user) => user.role === role).length,
    }));

    return {
      total: users.length,
      unlocked: users.filter((user) => user.isEditAllowed).length,
      locked: users.filter((user) => !user.isEditAllowed).length,
      departmentList: [...departments.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value),
      roleList: roles,
      recent: [...users]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 5),
    };
  }, [users]);

  return { users, loading, error, reload: load, stats };
}

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OrgChartNode, OrgChartTreeNode, OrgChartSyncPayload } from '~/types';
import { getOrgChartComposable, syncOrgChartComposable } from '~/composables/orgChartApiComposable';

export const useOrgChartStore = defineStore('orgChartStore', () => {
  const nodes = ref<OrgChartNode[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const { t } = useI18n();

  const reset = () => {
    nodes.value = [];
    error.value = null;
    loading.value = false;
  };

  const setError = (msg: string | null) => {
    error.value = msg;
  };

  const tree = computed<OrgChartTreeNode[]>(() => {
    // Map parent_id -> children
    const map = new Map<number | null, OrgChartTreeNode[]>();
    const nodeMap = new Map<number, OrgChartTreeNode>();

    nodes.value.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    nodes.value.forEach((node) => {
      const treeNode = nodeMap.get(node.id)!;
      if (!map.has(node.parent_id)) {
        map.set(node.parent_id, []);
      }
      map.get(node.parent_id)!.push(treeNode);
    });

    // Assign children and sort by position recursively
    const assignChildren = (parentId: number | null): OrgChartTreeNode[] => {
      const children = map.get(parentId) || [];
      children.sort((a, b) => a.position - b.position);
      children.forEach((child) => {
        child.children = assignChildren(child.id);
      });
      return children;
    };

    return assignChildren(null); // Return root nodes
  });

  const fetchOrgChart = async () => {
    try {
      loading.value = true;
      setError(null);
      const res = await getOrgChartComposable();
      if (res) {
        res.forEach((n: any) => {
          n.id = Number(n.id);
          if (n.parent_id !== null && n.parent_id !== undefined) n.parent_id = Number(n.parent_id);
          if (n.user_id !== null && n.user_id !== undefined) n.user_id = Number(n.user_id);
          if (n.position !== null && n.position !== undefined) n.position = Number(n.position);
        });
        nodes.value = res;
      }
    } catch (err: any) {
      console.error(err);
      setError(t('errors.orgChart.fetchFailed'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const saveOrgChart = async (newNodes: OrgChartSyncPayload['nodes']) => {
    try {
      loading.value = true;
      setError(null);
      const res = await syncOrgChartComposable({ nodes: newNodes });
      if (res) {
        res.forEach((n: any) => {
          n.id = Number(n.id);
          if (n.parent_id !== null && n.parent_id !== undefined) n.parent_id = Number(n.parent_id);
          if (n.user_id !== null && n.user_id !== undefined) n.user_id = Number(n.user_id);
          if (n.position !== null && n.position !== undefined) n.position = Number(n.position);
        });
        nodes.value = res;
      }
    } catch (err: any) {
      console.error(err);
      setError(t('errors.orgChart.saveFailed'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    nodes,
    loading,
    error,
    tree,
    fetchOrgChart,
    saveOrgChart,
    reset,
  };
});

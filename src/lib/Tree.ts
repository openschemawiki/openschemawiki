export type JsonTree<T = any> = {
	key: TreeKey,
	value: T,
	children: JsonTree<T>[]
}

export class TreeNode<T = any> {
	key: TreeKey;
	value: T;
	parent: TreeNode | null;
	children: TreeNode[];

  constructor(key: TreeKey, value: T, parent: TreeNode | null = null) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = [];
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get hasChildren() {
    return !this.isLeaf;
  }
}

type TreeKey = string | number | Symbol;

export class Tree<T = any> {
	root: TreeNode<T>;
  constructor(key: TreeKey, value: T) {
    this.root = new TreeNode<T>(key, value);
  }

  *preOrderTraversal(node = this.root): Generator<TreeNode> {
    yield node;
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.preOrderTraversal(child);
      }
    }
  }

  *postOrderTraversal(node = this.root): Generator<TreeNode> {
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.postOrderTraversal(child);
      }
    }
    yield node;
  }

  insert<T = any>(parentNodeKey: TreeKey, key: TreeKey, value: T) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode<T>(key, value, node));
        return true;
      }
    }
    return false;
  }

  remove(key: TreeKey) {
    for (let node of this.preOrderTraversal()) {
      const filtered = node.children.filter(c => c.key !== key);
      if (filtered.length !== node.children.length) {
        node.children = filtered;
        return true;
      }
    }
    return false;
  }

  find(key: TreeKey) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) return node;
    }
    return undefined;
  }

	jsonify(node = this.root): JsonTree {
		return {
			key: node.key,
			value: node.value,
			children: node.children.map((child) => this.jsonify(child))
		}
	}
}
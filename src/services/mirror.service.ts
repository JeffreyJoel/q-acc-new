import axios from "axios";

const ARWEAVE_URL = "https://arweave.net";

export interface MirrorArticle {
  description: string;
  id: string;
  title: string;
  body: string;
  timestamp?: number;
  author?: string;
  mirrorXyzContentDigest?: string;
  imageURI: string;
  featuredImageURI?: string;
  coverImageURI?: string;
  thumbnailURI?: string;
}

interface ArweaveTransaction {
  id: string;
  anchor: string;
  signature: string;
  recipient: string;
  owner: {
    address: string;
  };
  tags: Array<{
    name: string;
    value: string;
  }>;
  data: {
    size: string;
    type: string;
  };
  block: {
    id: string;
    timestamp: number;
    height: number;
    previous: string;
  };
  bundledIn?: {
    id: string;
  };
}

interface ArweaveTransactions {
  pageInfo: {
    hasNextPage: boolean;
  };
  edges: Array<{
    node: ArweaveTransaction;
  }>;
}

const address = "0x0C49031B01eB1c41cBB127501E4E317F7e739D7E";

export const fetchMirrorTransactions =
  async (): Promise<ArweaveTransactions> => {
    try {
      const result = await axios.post(
        `${ARWEAVE_URL}/graphql`,
        {
          query: `
          query {
            transactions(
             owners:["Ky1c1Kkt-jZ9sY1hvLF5nCf6WWdBhIU5Un_BMYh-t3c"]
              tags: [
                { name: "App-Name", values: ["MirrorXYZ"] }
                {
                  name: "Contributor"
                  values: ["${address}"]
                }
              ]
              sort: HEIGHT_DESC
              first: 100
            ) {
              pageInfo {
                hasNextPage
              }
              edges {
                node {
                  id
                  anchor
                  signature
                  recipient
                  owner {
                    address
                  }
                  tags {
                    name
                    value
                  }
                  data {
                    size
                    type
                  }
                  block {
                    id
                    timestamp
                    height
                    previous
                  }
                  bundledIn {
                    id
                  }
                }
              }
            }
          }
        `,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return result.data.data.transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  };

export const getArweaveTransactions = (transactions: ArweaveTransactions) => {
  const map = new Map();
  transactions.edges.forEach((edge) => {
    const { id, tags, block } = edge.node;
    const originContentDigest = tags.find(
      (tag) => tag.name === "Original-Content-Digest"
    )?.value;

    if (!originContentDigest) {
      return;
    }

    if (!map.has(originContentDigest)) {
      map.set(originContentDigest, {
        id,
        node: edge.node,
      });
    } else {
      const target = map.get(originContentDigest);

      if (target.node.block.timestamp < block.timestamp) {
        map.set(originContentDigest, {
          id,
          node: edge.node,
        });
      }
    }
  });

  const list = Array.from(map.entries()).map(([digest, item]) => {
    return {
      id: item.id,
      mirrorXyzContentDigest: digest,
      timestamp: item.node.block.timestamp,
    };
  });

  // Sort by timestamp descending (most recent first)
  return list.sort((a, b) => b.timestamp - a.timestamp);
};

// Fetch article content from Arweave
export const fetchArticleContent = async (transactionId: string) => {
  try {
    const response = await axios.get(`${ARWEAVE_URL}/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching article ${transactionId}:`, error);
    return null;
  }
};

export const fetchMirrorArticles = async (
  limit?: number
): Promise<MirrorArticle[]> => {
  try {
    const transactions = await fetchMirrorTransactions();
    const transactionList = getArweaveTransactions(transactions);

    // Apply limit if specified
    const limitedList = limit
      ? transactionList.slice(0, limit)
      : transactionList;

    const list = await Promise.all(
      limitedList.map(async ({ id, mirrorXyzContentDigest, timestamp }) => {
        const transactionsData = await fetchArticleContent(id);
        if (!transactionsData) return null;

        return {
          ...transactionsData,
          mirrorXyzContentDigest,
          arweaveTimestamp: timestamp,
        };
      })
    );

    const articles = list
      // .filter(article => article !== null)
      .map((article) => {
        return {
          id: article.id || article.mirrorXyzContentDigest,
          title: article.title || article.content?.title || "Untitled Article",
          description:
            article.description ||
            article.content?.description ||
            article.wnft?.description ||
            "",
          body: article.body || article.content?.body || article.content || "",
          timestamp:
            article.content?.timestamp ||
            article.timestamp ||
            article.arweaveTimestamp,
          author: article.author || article.content?.author || address,
          mirrorXyzContentDigest: article.mirrorXyzContentDigest,
          imageURI: article.wnft?.imageURI,
        };
      })
      .sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        return timestampB - timestampA;
      });

    return articles;
  } catch (error) {
    console.error("Error fetching mirror articles:", error);
    return [];
  }
};

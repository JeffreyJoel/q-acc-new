import axios from 'axios';

const ARWEAVE_URL = "https://arweave.net";

export interface MirrorArticle {
  id: string;
  title: string;
  body: string;
  timestamp?: number;
  author?: string;
  mirrorXyzContentDigest?: string;
  imageURI: string;

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

export const fetchMirrorTransactions = async (): Promise<ArweaveTransactions> => {
  try {
    const result = await axios.post(
      `${ARWEAVE_URL}/graphql`,
      {
        query: `
          query {
            transactions(
              tags: [
                { name: "App-Name", values: ["MirrorXYZ"] }
                {
                  name: "Contributor"
                  values: ["${address}"]
                }
              ]
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
        `
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // console.log('Arweave transactions result:', result.data.data.transactions);
    
    return result.data.data.transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Get transaction IDs with deduplication logic
export const getArweaveTransactions = (transactions: ArweaveTransactions) => {
  const map = new Map();
  transactions.edges.forEach((edge) => {
    const { id, tags, block } = edge.node;
    const originContentDigest = tags.find(
      (tag) => tag.name === 'Original-Content-Digest'
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
    };
  });
  return list;
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

// Fetch and format all articles
export const fetchMirrorArticles = async (): Promise<MirrorArticle[]> => {
  try {
    const transactions = await fetchMirrorTransactions();
    const transactionList = getArweaveTransactions(transactions);
    
    const list = await Promise.all(
      transactionList.map(async ({ id, mirrorXyzContentDigest }) => {
        const transactionsData = await fetchArticleContent(id);
        if (!transactionsData) return null;
        
        return {
          ...transactionsData,
          mirrorXyzContentDigest,
        };
      })
    );

    console.debug('===uideas', list);
    
    // Filter out null results and format as MirrorArticle
    const articles = list
      .filter(article => article !== null)
      .map(article => ({
        id: article.id || article.mirrorXyzContentDigest,
        title: article.title || article.content?.title || 'Untitled Article',
        body: article.body || article.content?.body || article.content || '',
        timestamp: article.content?.timestamp || article.timestamp,
        author: article.author || address,
        mirrorXyzContentDigest: article.mirrorXyzContentDigest,
        imageURI: article.content?.imageURI || '',
      }));
    
    return articles;
  } catch (error) {
    console.error('Error fetching mirror articles:', error);
    return [];
  }
};
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { graphqlOperation, API } from "aws-amplify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  Icon,
  Tag,
  Tooltip,
  Popover,
  Button,
  Notification,
} from "element-react";

import { deleteMarket } from "../graphql/mutations";
import { onDeleteMarket } from "../graphql/subscriptions";
import { onCreateMarket } from "../graphql/subscriptions";

const listMarkets = `
      query ListMarkets(
        $filter: ModelMarketFilterInput
        $limit: Int
        $nextToken: String
      ) {
        listMarkets(filter: $filter, limit: $limit, nextToken: $nextToken) {
          items {
            id
            name
            products {
              items {
                id
              }
              nextToken
            }
            tags
            owner
            createdAt
          }
          nextToken
        }
      }
    `;

const MarketList = ({ searchResults, user }) => {
  const [markets, setMarkets] = useState([]);
  const [deleteMarketDialog, setDeleteMarketDialog] = useState(false);

  useEffect(() => {
    listMarketsFn();
  }, []);

  useEffect(() => {
    let subscription;

    async function setupSubscription() {
      subscription = await API.graphql(
        graphqlOperation(onCreateMarket)
      ).subscribe({
        next: (data) => {
          const newMarket = data.value.data.onCreateMarket;
          const prevMarkets = markets.filter(
            (market) => market.id !== newMarket.id
          );
          const updatedMarkets = [newMarket, ...prevMarkets];
          setMarkets(updatedMarkets);
        },
      });
    }
    setupSubscription();
    return () => subscription.unsubscribe();
  }, [markets]);

  useEffect(() => {
    let subscription;
    async function setupDeleteSubscription() {
      subscription = await API.graphql(
        graphqlOperation(onDeleteMarket)
      ).subscribe({
        next: (marketData) => {
          const deletedMarket = marketData.value.data.onDeleteMarket;
          const updatedMarkets = markets.filter(
            (item) => item.id !== deletedMarket.id
          );
          setMarkets(updatedMarkets);
        },
      });
    }
    setupDeleteSubscription();
    return () => subscription.unsubscribe();
  }, [markets]);

  const listMarketsFn = async () => {
    try {
      const results = await API.graphql(graphqlOperation(listMarkets));
      const marketData = results.data.listMarkets.items;
      setMarkets(marketData);
    } catch (err) {
      console.log("error fetching todos");
    }
  };

  const handleDeleteMarket = async (marketId) => {
    try {
      setDeleteMarketDialog(true);
      const input = {
        id: marketId,
      };
      await API.graphql(graphqlOperation(deleteMarket, { input }));
      Notification({
        title: "Success",
        message: "Market successfully deleted!",
        type: "success",
        duration: 2000,
      });
    } catch (err) {
      console.error(`Failed to delete product with id ${marketId}`, err);
    }
  };

  const marketLists = searchResults.length > 0 ? searchResults : markets;

  return (
    <>
      {searchResults.length > 0 ? (
        <h2 className="text-green">
          <Icon type="success" name="check" className="icon" />
          {searchResults.length} Results
        </h2>
      ) : (
        <h2 className="header">
          <FontAwesomeIcon
            icon={faStore}
            size="lg"
            style={{ paddingRight: "5px" }}
          />
          Markets
        </h2>
      )}

      {marketLists.map((market) => {
        const isMarketOwner = user && user.username === market.owner;
        return (
          <div key={market.id} className="my-2">
            <Card
              bodyStyle={{
                padding: "0.7em",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span className="flex">
                  <Tooltip
                    placement="top-start"
                    content="Click to see available products"
                  >
                    <Link
                      className="link"
                      to={`/markets/${market.id}`}
                      style={{ color: "#00BFFF" }}
                    >
                      {market.name}
                    </Link>
                  </Tooltip>
                  <span style={{ color: "#f90" }}>
                    {!market.products.items ? 0 : market.products.items.length}
                  </span>
                  <FontAwesomeIcon icon={faShoppingCart} />
                </span>
                <div style={{ color: "var(--lightSquidInk)" }}>
                  Owned by {market.owner}
                </div>
              </div>
              <div>
                {market.tags &&
                  market.tags.map((tag) => (
                    <Tag key={tag} type="danger" className="mx-1">
                      {tag}
                    </Tag>
                  ))}
                {isMarketOwner && (
                  <Popover
                    placement="bottom"
                    width="160"
                    trigger="click"
                    visible={deleteMarketDialog}
                    content={
                      <>
                        <p>Do you want to delete this market?</p>
                        <div className="text-right">
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={() => setDeleteMarketDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            size="mini"
                            className="m-1"
                            onClick={() => handleDeleteMarket(market.id)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <Button
                      onClick={() => setDeleteMarketDialog(true)}
                      type="danger"
                      plain={true}
                      icon="delete"
                    />
                  </Popover>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </>
  );
};

export default MarketList;

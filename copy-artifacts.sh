mkdir frontend/src/artifacts

FROM_PATH=artifacts/contracts
TO_PATH=frontend/src/artifacts

cat $FROM_PATH/Marketplace.sol/Marketplace.json > $TO_PATH/Marketplace.json
cat $FROM_PATH/XNft.sol/XNft.json > $TO_PATH/XNft.json
cat $FROM_PATH/XToken.sol/XToken.json > $TO_PATH/XToken.json

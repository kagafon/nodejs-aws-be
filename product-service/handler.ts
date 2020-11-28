import 'source-map-support/register';

import getProductsList from './handlers/getProductsList';
import getProductById from './handlers/getProductById';
import addProduct from './handlers/addProduct';
import catalogBatchProcess from './handlers/catalogBatchProcess';

export { getProductsList, getProductById, addProduct, catalogBatchProcess };

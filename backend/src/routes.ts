import { Request, Response, Router } from 'express';

import multer from 'multer';
import uploadConfig from "./config/multer.js";
import { CreateUserController } from './controllers/user/createUserController.js';
import { createUserSchema, authUserSchema } from './schemas/userSchema.js';
import { AuthUserController } from './controllers/user/AuthUserController.js';
import { DetailUserController } from './controllers/user/DetailUserController.js';
import { isAuthenticated } from './middlewares/IsAuthenticated.js';
import { CreateCategoryController } from './controllers/category/CreateCategoryController.js';
import { isAdmin } from './middlewares/IsAdmin.js';
import { createCategorySchema, updateCategorySchema } from './schemas/categorySchema.js';
import { ListCategoriesController } from './controllers/category/ListCategoriesController.js';
import { CreateProductController } from './controllers/product/CreateProductController.js';
import { createProductSchema, updateProductSchema } from './schemas/productSchema.js';
import { ListProductsController } from './controllers/product/ListProductsController.js';
import { listProductsSchema } from './schemas/productSchema.js';
import { DeleteProductController } from './controllers/product/DeleteProductController.js';
import { ListProductsByCategoryController } from './controllers/product/ListProductsByCategoryController.js';
import { listProductsByCategorySchema } from './schemas/productSchema.js';
import { CreateOrderController } from './controllers/order/CreateOrderController.js';
import { AddItemSchema, createOrderSchema, DeleteOrderSchema, FinishOrderSchema, getOrderSchema, RemoveItemSchema, SendOrderSchema } from './schemas/orderSchema.js';
import { ListUsersAdminController } from './controllers/user/admin/ListUsersAdminController.js';
import { UpdateUserRoleAdminController } from './controllers/user/admin/UpdateUserRoleAdminController.js';
import { DeleteUserAdminController } from './controllers/user/admin/DeleteUserAdminController.js';
import { updateUserRoleParamsSchema, updateUserRoleSchema } from './schemas/userAdminSchema.js';
import { validateSchema } from './middlewares/validateSchema.js';
import { createAddressSchema, deleteAddressSchema, updateAddressSchema } from './schemas/adressSchema.js';
import { CreateAddressController } from './controllers/address/CreateAddressController.js';
import { ListAddressController } from './controllers/address/ListAddressController.js';
import { DeleteAddressController } from './controllers/address/DeleteAddressController.js';
import { UpdateCategoryController } from './controllers/category/UpdateCategoryController.js';
import { UpdateAddressController } from './controllers/address/UpdateAddressController.js';
import { DeleteCategoryController } from './controllers/category/DeleteCategoryController.js';
import { UpdateProductController } from './controllers/product/UpdateProductController.js';
import { GetOrCreateCartController } from './controllers/cart/GetOrCreateCartController.js';
import { AddCartItemController } from './controllers/cart/AddCartItemController.js';
import { addCartItemSchema, updateCartItemSchema } from './schemas/cartSchema.js';
import { DeleteCartItemController } from './controllers/cart/DeleteCartItemController.js';
import { UpdateCartItemController } from './controllers/cart/UpdateCartItemController.js';
import { GetOrderController } from './controllers/order/GetOrderController.js';
import { ListOrdersController } from './controllers/order/ListOrdersController.js';
import { UpdateOrderStatusController } from './controllers/order/UpdateOrderStatusController.js';
import { ListAllOrdersAdminController } from './controllers/order/ListAllOrdersAdminController.js';
import { GetOrderAdminController } from './controllers/order/GetOrderAdminController.js';

const router = Router();
const upload = multer(uploadConfig);




router.post("/users", validateSchema(createUserSchema), new CreateUserController().handle)
router.post("/session", validateSchema(authUserSchema), new AuthUserController().handle)
router.get("/me", isAuthenticated, new DetailUserController().handle)

router.get("/category", new ListCategoriesController().handle);
router.post("/category", isAuthenticated, isAdmin, validateSchema(createCategorySchema), new CreateCategoryController().handle);
router.put("/category/:id", isAuthenticated, isAdmin, validateSchema(updateCategorySchema), new UpdateCategoryController().handle);
router.delete("/category/:id", isAuthenticated, isAdmin, new DeleteCategoryController().handle);

router.post("/address", isAuthenticated, validateSchema(createAddressSchema), new CreateAddressController().handle);
router.get("/address", isAuthenticated, new ListAddressController().handle);
router.delete("/address", isAuthenticated, validateSchema(deleteAddressSchema), new DeleteAddressController().handle);
router.put("/address", isAuthenticated, validateSchema(updateAddressSchema), new UpdateAddressController().handle);

router.post("/product", isAuthenticated, isAdmin, upload.single("file"), validateSchema(createProductSchema), new CreateProductController().handle);
router.get("/products", validateSchema(listProductsSchema), new ListProductsController().handle)
router.put("/product", isAuthenticated, isAdmin, upload.single("file"), validateSchema(updateProductSchema), new UpdateProductController().handle)
router.get("/category/product", validateSchema(listProductsByCategorySchema), new ListProductsByCategoryController().handle);
router.delete("/product", isAuthenticated, isAdmin, new DeleteProductController().handle)

router.post("/order", isAuthenticated, validateSchema(createOrderSchema), new CreateOrderController().handle)
router.get("/order/:order_id", isAuthenticated, validateSchema(getOrderSchema), new GetOrderController().handle)
router.get("/orders", isAuthenticated, new ListOrdersController().handle)
router.patch("/order/:order_id/status", isAuthenticated, isAdmin, new UpdateOrderStatusController().handle)

router.get("/admin/orders", isAuthenticated, isAdmin, new ListAllOrdersAdminController().handle)
router.get("/admin/orders/:order_id", isAuthenticated, isAdmin, new GetOrderAdminController().handle)

router.get("/admin/users", isAuthenticated, isAdmin, new ListUsersAdminController().handle)
router.put("/admin/users/:id", isAuthenticated, isAdmin, validateSchema(updateUserRoleParamsSchema), validateSchema(updateUserRoleSchema), new UpdateUserRoleAdminController().handle)
router.delete("/admin/users/:id", isAuthenticated, isAdmin, validateSchema(updateUserRoleParamsSchema), new DeleteUserAdminController().handle)


router.get("/cart", isAuthenticated, new GetOrCreateCartController().handle)
router.post("/cart/items", isAuthenticated, validateSchema(addCartItemSchema), new AddCartItemController().handle)
router.delete("/cart/items/:id", isAuthenticated, new DeleteCartItemController().handle)
router.patch("/cart/items/:id", isAuthenticated, validateSchema(updateCartItemSchema), new UpdateCartItemController().handle)

export { router };
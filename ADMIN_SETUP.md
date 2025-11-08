# Admin Setup Instructions

## How to Make a User an Admin

To grant admin privileges to a user, you need to add them to the `user_roles` table with the `admin` role.

### Steps:

1. Go to your Lovable Cloud backend (click the "View Backend" button in project settings)
2. Navigate to the Table Editor
3. Open the `user_roles` table
4. Click "Insert row" and add:
   - **user_id**: The UUID of the user (get this from the `profiles` table)
   - **role**: Select `admin` from the dropdown

OR run this SQL query in the SQL editor (replace the email with the actual admin user's email):

```sql
-- First, get the user ID
SELECT id, email FROM profiles WHERE email = 'admin@example.com';

-- Then insert the admin role (replace USER_ID with the actual UUID from above)
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID', 'admin');
```

## Admin Dashboard Features

Once a user has admin privileges, they can access:

- **Dashboard** (`/admin`) - Overview with statistics
- **Shops Management** (`/admin/shops`) - View and activate/deactivate shops
- **Products Management** (`/admin/products`) - View all products across shops
- **Orders Management** (`/admin/orders`) - View all orders on the platform
- **Users Management** (`/admin/users`) - View all registered users
- **Special Offers** (`/admin/offers`) - Full CRUD for promotional offers

## Special Offers Management

Admins can:
- Create new promotional offers for customers or entrepreneurs
- Edit existing offers
- Activate/deactivate offers
- Set expiration dates, discount codes, and custom CTAs
- Target specific audiences (customers vs entrepreneurs)

The offers created in the admin panel automatically appear on the homepage in the respective audience sections.

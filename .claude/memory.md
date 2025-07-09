# Claude Memory - Quorum Project

## UUIDv7 Implementation (2025-07-09)

### Key Learnings

1. **Package Name Confusion**
   - The GitHub repo is `ryanwinchester/uuidv7`
   - The Hex package name is `uuid_v7` (with underscore, not `uuidv7`)
   - Current version: 0.6.0

2. **Ecto Type Module**
   - The Ecto type is provided by the library as `UUIDv7.Type`
   - It's conditionally compiled with `if Code.ensure_loaded?(Ecto.Type)`
   - No need to create a custom Ecto type wrapper

3. **PostgreSQL UUID Extension Not Needed**
   - Initially created migration for `uuid-ossp` extension
   - Realized it's unnecessary since UUIDs are generated in Elixir
   - The `uuid-ossp` extension is only needed for PostgreSQL-side UUID generation

4. **Base Schema Pattern**
   - Created `Quorum.Schema` module to standardize UUID usage
   - All schemas should `use Quorum.Schema` instead of `use Ecto.Schema`
   - Automatically configures:
     - `@primary_key {:id, UUIDv7.Type, autogenerate: true}`
     - `@foreign_key_type UUIDv7.Type`
     - `@timestamps_opts [type: :utc_datetime]`

5. **Generator Configuration**
   - Updated `config/config.exs` to set `binary_id: true` for generators
   - This ensures Phoenix generators create UUID-based schemas by default

### Common Pitfalls to Avoid
- Don't implement custom UUID encoding/decoding - the library handles it
- Don't add PostgreSQL UUID extensions unless using DB-side generation
- Remember the package name is `uuid_v7` not `uuidv7` in mix.exs
- Always use absolute paths with file operations

### Verification
- UUIDv7 IDs are time-ordered (sequential)
- Format: starts with timestamp-based prefix (e.g., `0197ed7e-...`)
- Successfully tested with User schema creation
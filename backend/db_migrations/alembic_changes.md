# Alembic snippets for Map Service (SQLAlchemy)

Example migration to add patient lat/lng and assigned fields to `incidents` table:

```python
from alembic import op
import sqlalchemy as sa

revision = 'xxxx_add_incident_fields'

def upgrade():
    op.add_column('incidents', sa.Column('patient_lat', sa.Float(), nullable=True))
    op.add_column('incidents', sa.Column('patient_lng', sa.Float(), nullable=True))
    op.add_column('incidents', sa.Column('assigned_ambulance_id', sa.String(length=50), nullable=True))
    op.add_column('incidents', sa.Column('nearest_hospitals_cache', sa.JSON(), nullable=True))
    op.create_index('ix_incidents_patient_loc', 'incidents', ['patient_lat','patient_lng'])


def downgrade():
    op.drop_index('ix_incidents_patient_loc', table_name='incidents')
    op.drop_column('incidents', 'nearest_hospitals_cache')
    op.drop_column('incidents', 'assigned_ambulance_id')
    op.drop_column('incidents', 'patient_lng')
    op.drop_column('incidents', 'patient_lat')
```

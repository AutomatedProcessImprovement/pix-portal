"""Add file type and name columns

Revision ID: 1691d64383ae
Revises: d0cae3dcfb9f
Create Date: 2023-11-06 13:27:43.435905

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1691d64383ae'
down_revision: Union[str, None] = 'd0cae3dcfb9f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('file', sa.Column('name', sa.String(), nullable=False))
    op.add_column('file', sa.Column('type', sa.String(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('file', 'type')
    op.drop_column('file', 'name')
    # ### end Alembic commands ###

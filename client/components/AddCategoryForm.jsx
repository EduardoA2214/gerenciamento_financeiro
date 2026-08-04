import { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Alert from './ui/Alert';
import { IconPlus } from './icons';
import { createCategoria } from '../services/financeService';

export default function AddCategoryForm({ onCreated }) {
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('Informe um nome para a categoria.');
      return;
    }

    setSubmitting(true);
    try {
      await createCategoria(nome.trim());
      setNome('');
      await onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-5 lg:p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">Nova categoria</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            id="nova-categoria"
            label="Nome"
            placeholder="Ex: Lazer"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={submitting} className="shrink-0">
          <IconPlus className="h-4 w-4" />
          {submitting ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </form>
      <Alert>{error}</Alert>
    </Card>
  );
}

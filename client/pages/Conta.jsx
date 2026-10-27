import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getUsuario, getFoto } from '../utils/auth';
import { atualizarSenha, atualizarFoto, removerFoto, excluirConta } from '../services/authService';
import { fileToAvatarDataUrl, isSupportedImage, isWithinSizeLimit } from '../utils/image';
import { IconUser, IconCamera, IconLock, IconTrash } from '../components/icons';

export default function Conta() {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [formAberto, setFormAberto] = useState(null);

  const [foto, setFoto] = useState(getFoto());
  const [fotoError, setFotoError] = useState('');
  const [savingFoto, setSavingFoto] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [senhaSuccess, setSenhaSuccess] = useState('');
  const [savingSenha, setSavingSenha] = useState(false);

  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [exclusaoError, setExclusaoError] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  function toggleForm(tipo) {
    setFotoError('');
    setSenhaError('');
    setSenhaSuccess('');
    setExclusaoError('');
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setSenhaExclusao('');
    setFormAberto((atual) => (atual === tipo ? null : tipo));
  }

  async function handleFotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setFotoError('');

    if (!isSupportedImage(file)) {
      setFotoError('Selecione um arquivo de imagem.');
      return;
    }

    if (!isWithinSizeLimit(file)) {
      setFotoError('A imagem deve ter no máximo 8MB.');
      return;
    }

    setSavingFoto(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      const data = await atualizarFoto(dataUrl);
      setFoto(data.fotoPerfil);
    } catch (err) {
      setFotoError(err.message);
    } finally {
      setSavingFoto(false);
    }
  }

  async function handleRemoverFoto() {
    setFotoError('');
    setSavingFoto(true);
    try {
      await removerFoto();
      setFoto(null);
    } catch (err) {
      setFotoError(err.message);
    } finally {
      setSavingFoto(false);
    }
  }

  async function handleSenhaSubmit(event) {
    event.preventDefault();
    setSenhaError('');
    setSenhaSuccess('');

    if (novaSenha !== confirmarSenha) {
      setSenhaError('A confirmação não coincide com a nova senha.');
      return;
    }

    setSavingSenha(true);
    try {
      await atualizarSenha(senhaAtual, novaSenha);
      setSenhaSuccess('Senha atualizada com sucesso.');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      setSenhaError(err.message);
    } finally {
      setSavingSenha(false);
    }
  }

  function handleExcluirSubmit(event) {
    event.preventDefault();
    setExclusaoError('');
    setConfirmarExclusao(true);
  }

  async function handleConfirmExcluir() {
    setExcluindo(true);
    try {
      await excluirConta(senhaExclusao);
      navigate('/login', { replace: true });
    } catch (err) {
      setExclusaoError(err.message);
      setExcluindo(false);
      setConfirmarExclusao(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-2 lg:max-w-xl">
      <Card className="flex items-center gap-4 p-5 lg:p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-page text-ink-muted ring-1 ring-line">
          {foto ? (
            <img src={foto} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <IconUser className="h-8 w-8" />
          )}
        </div>
        <div>
          <p className="text-base font-semibold capitalize text-ink">{usuario || 'Usuário'}</p>
          <p className="text-xs text-ink-muted">Gerencie sua conta</p>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant={formAberto === 'foto' ? 'secondary' : 'primary'} onClick={() => toggleForm('foto')}>
          <IconCamera className="h-4 w-4" />
          Mudar foto
        </Button>
        <Button variant={formAberto === 'senha' ? 'secondary' : 'primary'} onClick={() => toggleForm('senha')}>
          <IconLock className="h-4 w-4" />
          Alterar senha
        </Button>
        <Button variant={formAberto === 'excluir' ? 'secondary' : 'danger'} onClick={() => toggleForm('excluir')}>
          <IconTrash className="h-4 w-4" />
          Excluir conta
        </Button>
      </div>

      {formAberto === 'foto' && (
        <Card className="p-5 lg:p-6">
          <h2 className="mb-1 text-sm font-semibold text-ink">Foto de perfil</h2>
          <p className="mb-4 text-xs text-ink-muted">Aparece na barra lateral do painel e na tela de login.</p>

          <Alert>{fotoError}</Alert>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-page text-ink-muted ring-1 ring-line">
              {foto ? (
                <img src={foto} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <IconUser className="h-9 w-9" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                {savingFoto ? 'Enviando...' : foto ? 'Trocar foto' : 'Escolher foto'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={savingFoto}
                  onChange={handleFotoChange}
                />
              </label>

              {foto && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemoverFoto}
                  disabled={savingFoto}
                  className="!text-critical hover:!bg-critical/10"
                >
                  Remover foto
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {formAberto === 'senha' && (
        <Card className="p-5 lg:p-6">
          <h2 className="mb-1 text-sm font-semibold text-ink">Alterar senha</h2>
          <p className="mb-4 text-xs text-ink-muted">Confirme a senha atual para definir uma nova.</p>
          <form onSubmit={handleSenhaSubmit} className="flex flex-col gap-4">
            <Alert>{senhaError}</Alert>
            <Alert variant="success">{senhaSuccess}</Alert>

            <Input
              id="senhaAtual"
              label="Senha atual"
              type="password"
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
            />

            <Input
              id="novaSenha"
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              minLength={5}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />

            <Input
              id="confirmarSenha"
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              minLength={5}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />

            <div className="flex gap-3">
              <Button type="submit" disabled={savingSenha} className="self-start">
                {savingSenha ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setFormAberto(null)} className="self-start">
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {formAberto === 'excluir' && (
        <Card className="p-5 lg:p-6">
          <h2 className="mb-1 text-sm font-semibold text-critical">Excluir conta</h2>
          <p className="mb-4 text-xs text-ink-muted">
            Essa ação é permanente: sua conta e todas as suas rendas, gastos, assinaturas e categorias serão apagadas e
            não poderão ser recuperadas. Digite sua senha para confirmar.
          </p>
          <form onSubmit={handleExcluirSubmit} className="flex flex-col gap-4">
            <Alert>{exclusaoError}</Alert>

            <Input
              id="senhaExclusao"
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={senhaExclusao}
              onChange={(e) => setSenhaExclusao(e.target.value)}
              required
            />

            <div className="flex gap-3">
              <Button type="submit" variant="danger" disabled={excluindo} className="self-start">
                <IconTrash className="h-4 w-4" />
                {excluindo ? 'Excluindo...' : 'Excluir minha conta'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setFormAberto(null)} className="self-start">
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <ConfirmDialog
        open={confirmarExclusao}
        title="Excluir conta?"
        message={`Tem certeza que deseja excluir a conta "${usuario || 'Usuário'}"? Todos os seus dados serão apagados para sempre e essa ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir conta"
        loading={excluindo}
        onConfirm={handleConfirmExcluir}
        onCancel={() => setConfirmarExclusao(false)}
      />
    </div>
  );
}

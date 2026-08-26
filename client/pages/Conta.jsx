import { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { getUsuario, getFoto } from '../utils/auth';
import { atualizarUsuario, atualizarSenha, atualizarFoto, removerFoto } from '../services/authService';
import { fileToAvatarDataUrl, isSupportedImage, isWithinSizeLimit } from '../utils/image';
import { IconUser } from '../components/icons';

export default function Conta() {
  const [foto, setFoto] = useState(getFoto());
  const [fotoError, setFotoError] = useState('');
  const [savingFoto, setSavingFoto] = useState(false);

  const [usuario, setUsuario] = useState(getUsuario() || '');
  const [usuarioError, setUsuarioError] = useState('');
  const [usuarioSuccess, setUsuarioSuccess] = useState('');
  const [savingUsuario, setSavingUsuario] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [senhaSuccess, setSenhaSuccess] = useState('');
  const [savingSenha, setSavingSenha] = useState(false);

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

  async function handleUsuarioSubmit(event) {
    event.preventDefault();
    setUsuarioError('');
    setUsuarioSuccess('');
    setSavingUsuario(true);
    try {
      await atualizarUsuario(usuario);
      setUsuarioSuccess('Nome de usuário atualizado com sucesso.');
    } catch (err) {
      setUsuarioError(err.message);
    } finally {
      setSavingUsuario(false);
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

  return (
    <div className="flex flex-col gap-5 pt-2 lg:max-w-xl">
      <Card className="p-5 lg:p-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">Foto de perfil</h2>
        <p className="mb-4 text-xs text-ink-muted">Aparece na barra lateral do painel.</p>

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

      <Card className="p-5 lg:p-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">Nome de usuário</h2>
        <p className="mb-4 text-xs text-ink-muted">Usado para entrar na sua conta.</p>
        <form onSubmit={handleUsuarioSubmit} className="flex flex-col gap-4">
          <Alert>{usuarioError}</Alert>
          <Alert variant="success">{usuarioSuccess}</Alert>

          <Input
            id="usuario"
            label="Usuário"
            minLength={3}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          <Button type="submit" disabled={savingUsuario} className="self-start">
            {savingUsuario ? 'Salvando...' : 'Salvar usuário'}
          </Button>
        </form>
      </Card>

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

          <Button type="submit" disabled={savingSenha} className="self-start">
            {savingSenha ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

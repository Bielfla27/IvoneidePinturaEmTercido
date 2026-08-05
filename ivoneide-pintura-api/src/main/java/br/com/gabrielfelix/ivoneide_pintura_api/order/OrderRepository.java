package br.com.gabrielfelix.ivoneide_pintura_api.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gabrielfelix.ivoneide_pintura_api.user.User;

public interface OrderRepository extends JpaRepository<Order, Long> {

	List<Order> findByUsuarioOrderByCriadoEmDesc(User usuario);

	List<Order> findByUsuarioAndStatusOrderByCriadoEmDesc(User usuario, OrderStatus status);

	Optional<Order> findByIdAndUsuario(Long id, User usuario);
}
